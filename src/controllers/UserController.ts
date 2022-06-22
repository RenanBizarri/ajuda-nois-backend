import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/UserModel";
import MockExam from "../models/MockExamModel";
import Common from "../Common";
import Subject from "../models/SubjectModel";

const lvl = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const xp = [30, 90, 270, 650, 1400, 2300, 3400, 4800, 6400, 8500]
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function generateToken(params = {}){
    return jsonwebtoken.sign(params, process.env.PRIVATE_KEY!.replace(/\\n/gm, '\n') as string,{
        expiresIn: "30d",
        algorithm: "RS256"
    });
}

class UserController{
    public async createAdmin(req: any, res: any){
        try{
            let { 
                username,
                email,
                password,
            } = req.body;

            const usertype = "admin"
            const activated = true

            // O primeiro usuario é o admin
            let user = await User.findOne({usertype});
            if(user){
                return res.status(400).json({
                    error: "Já existe um administrador cadastrado no sistema."
                });           
            }

            // Verifica se os campos estão preenchidos
            if(!username || !email || !password || !usertype){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }            

            const created = new Date().toISOString().substring(0, 10)

            // Cria o usuario
            user = await new User({
                created,
                username,
                email,
                password,
                usertype,
                activated
            }).save();

            return res.status(200).json(user)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    public async createUser (req: any, res: any): Promise<Response>{
        try{
            let { 
                username,
                email,
                usertype
            } = req.body;

            let creator_id = req.body.user_id

            // Verifica se os campos estão preenchidos
            if(!username || !email  || !usertype){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            // O email precisa ser unico
            let user = await User.findOne({ email });
            if(user){
                return res.status(400).json({
                    error: "Usuario já cadastrado."
                });
            }

            const created = new Date().toISOString().substring(0, 10)
            const activated = true

            const password = crypto.randomBytes(10).toString("hex")

            // Apenas o admin pode criar professores
            if(usertype == "teacher"){
                const creator_user = await User.findById(creator_id);

                if(creator_user?.usertype != "admin"){
                    return res.status(400).json({
                        error: "Não autorizado."
                    });
                }else{
                    // Cria o usuario
                    user = await new User({
                        created,
                        username,
                        email,
                        password,
                        usertype,
                        activated
                    }).save();
                }
            }else{
                const experience = 0, level = 1

                // Cria o usuario
                user = await new User({
                    created,
                    username,
                    email,
                    password,
                    usertype,
                    activated,
                    experience,
                    level
                }).save();
            }

            await Common.sendMail(user.email, "new_user", "", password)

            return res.status(200).json(user);
        
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async login(req: any, res: any){
        const {email,password} = req.body;
    
        const user = await User.findOne ({email});
    
        if(!user)
            return res.status(400).json({message: 'Usuario não cadastrado'});
    
        if(!await bcrypt.compare(password, user.password))
            return res.status(400).json({message: 'Senha incorreta'});
    
        res.status(200).json({
            user,
            token: generateToken( {user_id: user.id}),
        });
    }

    async delete(req: any, res: any){
        try{
            let {
                id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Usuario para excluir"
                });
            }
    
            const user = await User.findById(id)

            switch(user?.usertype){
                case "admin":
                    return res.status(401).json({
                        message: "Não é possivel excluir o admin"
                    })
                    break
                case "student":
                    await User.findByIdAndDelete(id)
                    break
                case "teacher":
                    const deleter_user = await User.findById(req.body.user_id)
                    if(deleter_user?.usertype == "admin"){
                        await User.findByIdAndDelete(id)
                    }else{
                        return res.status(401).json({
                            message: "Somente o admin pode excluir professores"
                        })
                    }
                    break
                default:
                    return res.status(401).json({
                        message: "Usuario não encontrado"
                    })
                    break
            }
    
            return res.status(200).json({
                message: "Usuario excluido excluido"
            })
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async dashboard(req: any, res: any){
        try{
            const {
                user_id
            } = req.body
            
            const user = await User.findById(user_id)

            const date = new Date()
            const first = date.getDate() - date.getDay()
            const last = first + 6

            const firstDay = new Date(date.setDate(first)).toISOString()
            const lastDay = new Date(date.setDate(last)).toISOString()

            let response = {}

            switch(user?.usertype){
                case "admin":
                    const allStudents = await User.count({usertype: "student"})
                    const allTeachers = await User.count({usertype: {$in: ["admin", "teacher"]}})
                    const allMockExam = await MockExam.count()
                    const newStudents = await User.find({usertype: "student", activated: true})
                    const newTeachers = await User.find({usertype: {$in: ["admin", "teacher"]}, activated: true})

                    response = {
                        allStudents,
                        allTeachers,
                        allMockExam,
                        newStudents,
                        newTeachers
                    }

                    return res.status(200).json(response)
                    break
                case "teacher":
                    const subject = await Subject.find({user_id})
                    
                    const students = await User.aggregate([
                        {
                            $lookup: {
                                from: "quizzes",
                                localField: "quiz_score.quiz_id",
                                foreignField: "_id",
                                as: "quiz_info"
                            }
                        },
                        {
                            $lookup: {
                                from: "mock_exams",
                                localField: "mock_exams.mock_exam_id",
                                foreignField: "_id",
                                as: "mock_exams_info"
                            }
                        },
                        {
                            $match: {
                                activated: true,
                                usertype: "student"
                            }
                        }
                    ])

                    response = {
                        user,
                        subject,
                        students
                    }

                    return res.status(200).json(response)
                    break
                case "student":
                    const student = await User.aggregate([
                        {
                            $lookup: {
                                from: "quizzes",
                                localField: "quiz_score.quiz_id",
                                foreignField: "_id",
                                as: "quiz_info"
                            }
                        },
                        {
                            $lookup: {
                                from: "mock_exams",
                                localField: "mock_exams.mock_exam_id",
                                foreignField: "_id",
                                as: "mock_exams_info"
                            }
                        },
                        {
                            $lookup: {
                                from: "study_plans",
                                let: {"_id": "$user_id"},
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: ["$_id", "$$user_id"],
                                                    $gte: ["$$date", firstDay],
                                                    $lit: ["$$date", lastDay]
                                                }
                                            ]
                                        }
                                    }
                                }],
                                as: "study_plans_info"
                            }
                        },
                        {
                            $match: {
                                _id: user_id,
                                usertype: "student",
                            }
                        }
                    ])

                    response = {
                        student
                    }

                    return res.status(200).json(response)
                    break
                default:
                    return res.status(400).json({
                        error: "Usuario não encontrado" 
                    })
                    break
            }
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async changePassword(req: any, res: any){
        const {
            user_id,
            new_password,
        } = req.body

        let user = await User.findById(user_id)

        if(!user) return res.status(400).json({error: "Usuário não encontrado"})

        user.password = new_password
        user.password_reset_token = undefined
        user.password_reset_expire = undefined
        await user.save()

        return res.status(200).json(user)
    }

    async verifyResetToken(req: any, res: any){
        let reset_token = req.params.reset_token

        const user = await User.findOne({password_reset_token: reset_token})

        if(!user){
            return res.status(401).json({
                error: "Token invalido"
            })
        }

        if(user.password_reset_expire! < Date.now()){
            return res.status(401).json({
                error: "Token expirado"
            })
        }

        return res.status(200).json({
            message: "Token valido",
            user
        })
    }

    async requestRecoverPassword(req: any, res: any){
        const {
            email
        } = req.body

        const password_reset_token = crypto.randomBytes(20).toString("hex")
        const password_reset_expire = Date.now() + 3600000;

        const update_values = {
            password_reset_token, password_reset_expire
        }

        const user = await User.findOneAndUpdate({email}, update_values)
        
        if(!user){ 
            return res.status(400).json({
                error: "Nenhum usuario correspondente a esse email foi encontrado"
            })
        }

        const result = await Common.sendMail(email, "recover_pass", password_reset_token)

        return res.status(200).json({
            message: result
        });
    }

    async getAllUsers(req: any, res: any){
        const teachers = await User.find({usertype: {$in: ["admin", "teacher"]}})
        
        const students = await User.find({usertype: "student"})

        const response = {
            teachers,
            students
        }

        return res.status(200).json(response)
    }

    async updateXp(user: any, experience: any){
        user.experience = user.experience + experience

        let i = 0;
        while(user.experience > xp[i]){
            i++;
        }
        user.level = lvl[i];

        await user.save()

        return
    }

    async addPomodoro(req: any, res: any){
        const {
            user_id,
            time,
            area,
        } = req.body

        const date = new Date()
        const month = date.getMonth()
        const year = date.getFullYear()

        let user = await User.findById(user_id)

        if(!user){
            return res.status(400).json({
                error: "Usuario não encontrado"
            })
        }

        if(user.pomodoros){
            for(let i = 0; i < user.pomodoros?.length; i++){
                if( user.pomodoros[i].month == month &&  user.pomodoros[i].year == year){
                    switch(area){
                        case "human_sciences": 
                            user.pomodoros[i].pomodoro.humans_time += time
                            break
                        case "natural_sciences": 
                            user.pomodoros[i].pomodoro.natural_time += time
                            break
                        case "languages": 
                            user.pomodoros[i].pomodoro.languages_time += time
                            break
                        case "mathematics": 
                            user.pomodoros[i].pomodoro.maths_time += time
                            break
                    }

                    await user.save()

                    return res.status(200).json(user)
                }
            }
        }

        const pomodoro = {
            humans_time: 0,
            natural_time: 0,
            languages_time: 0,
            maths_time: 0
        }

        switch(area){
            case "human_sciences": 
                pomodoro.humans_time = time
                break
            case "natural_sciences": 
                pomodoro.natural_time += time
                break
            case "languages": 
                pomodoro.languages_time += time
                break
            case "mathematics": 
                pomodoro.maths_time += time
                break
        }

        const newPomodoro = {
            pomodoro,
            month,
            year
        }

        if(user.pomodoros){
            user.pomodoros.push(newPomodoro)
        }else{
            user.pomodoros = [newPomodoro]
        }

        await user.save()

        return res.status(200).json(user)
    }

    async updateUser(req: any, res: any){
        try{
            let {
                user_id,
                id,
                username,
                email,
                oldPassword,
                newPassword,
                activated
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do usuario para atualizar"
                });
            }

            const isSameUser = user_id === id
    
            // Verifica se os campos estão preenchidos
            if((!username && !email && !newPassword && isSameUser) || (!activated && !isSameUser)){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let user = await User.findById(id)
            const user1 = await User.findById(user_id)

            if(!user){
                return res.status(400).json({
                    error: "Usuario não encontrado."
                });
            }

            if(user_id === id){
                if(username) user.username = username
                if(email) user.email = email
                if(newPassword){
                    if(await bcrypt.compare(oldPassword, user.password)){
                        user.password = newPassword
                    }else{
                        return res.status(400).json({
                            error: "Senha antiga invalida."
                        });
                    }
                }
            }
            
            if(user1?.usertype === "admin" && activated){
                user.activated = activated
            }

            await user.save()

            return res.status(200).json(user)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new UserController()
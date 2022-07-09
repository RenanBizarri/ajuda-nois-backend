import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/UserModel";
import MockExam from "../models/MockExamModel";
import Common from "../Common";
import Subject from "../models/SubjectModel";
import StudyPlan from "../models/StudyPlanModel";
import Tip from "../models/TipModel";
import { ObjectId } from "mongodb";
import Topic from "../models/TopicModel";

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

async function handlerXp(user: any, experience: number){
    user.experience = user.experience + experience
    await user.save()

    let achievementsGained: any[] = []
    let i = 0;
    while(user.experience > xp[i]){
        i++;
    }
    if(lvl[i] > user.level){
        user.level = lvl[i]
        await user.save()

        const achievements = await levelUpAchievement(user)
        achievementsGained = achievementsGained.concat(achievements)
    }

    return achievementsGained
}

async function levelUpAchievement(user: any){
    try{
        let achievements = await Common.findAchievementMissing(user, ["level"])
        let achievementsGained: any[] = [], experience: number = 0
        
        const adiquired = new Date().toISOString().substring(0, 10)

        for(let i = 0; i < achievements.length; i++){
            const achievement = achievements[i]
            if(user.level >= achievement.quantity){
                const newAchievement = {
                    achievement_id: achievement._id,
                    adiquired
                }
                if(user.achievements){
                    user.achievements.push(newAchievement)
                }else{
                    user.achievements = [newAchievement]
                }
                experience += achievement.experience

                achievementsGained.push(achievement)
            }
        }   

        await user.save()

        if(experience > 0) achievementsGained = achievementsGained.concat(await handlerXp(user, experience)) 

        return achievementsGained
    }catch(error: any){
        return error
    }
}

async function pomodoroAchievement(user: any){
    try{
        let achievements = await Common.findAchievementMissing(user, ["pomodoro_time"])
        let achievementsGained: any[] = [], experience: number = 0

        if(achievements.length > 0){
            let humans_total_time: number = 0
            let natural_total_time: number = 0
            let languages_total_time: number = 0
            let maths_total_time: number = 0
            let total_time: number = 0

            const adiquired = new Date().toISOString().substring(0, 10)

            user.pomodoros.forEach((pomodoro: any): any => {
                humans_total_time += pomodoro.pomodoro.humans_time
                natural_total_time += pomodoro.pomodoro.natural_time
                languages_total_time += pomodoro.pomodoro.languages_time
                maths_total_time += pomodoro.pomodoro.maths_time
            })

            total_time = humans_total_time + natural_total_time + languages_total_time + maths_total_time
            
            achievements.forEach((achievement: any): any => {
                const newAchievement = {
                    achievement_id: achievement._id,
                    adiquired
                }
                switch(achievement.area){
                    case "human_sciences": 
                        if(humans_total_time >= achievement.quantity){
                            user.achievements.push(newAchievement)
                            achievementsGained.push(achievement)
                            experience += achievement.experience
                        } 
                        break
                    case "natural_sciences": 
                        if(natural_total_time >= achievement.quantity){
                            user.achievements.push(newAchievement)
                            achievementsGained.push(achievement)
                            experience += achievement.experience
                        }
                        break
                    case "languages": 
                        if(languages_total_time >= achievement.quantity){
                            user.achievements.push(newAchievement)
                            achievementsGained.push(achievement)
                            experience += achievement.experience
                        }
                        break
                    case "mathematics": 
                        if(maths_total_time >= achievement.quantity){
                            user.achievements.push(newAchievement)
                            achievementsGained.push(achievement)
                            experience += achievement.experience
                        }
                        break
                    default:
                        if(total_time >= achievement.quantity){
                            user.achievements.push(newAchievement)
                            achievementsGained.push(achievement)
                            experience += achievement.experience
                        }
                        break
                }
            })

            await user.save()

            if(experience > 0) achievementsGained = achievementsGained.concat(await handlerXp(user, experience)) 
        }

        return achievementsGained
    }catch(error: any){
        return error.message
    }
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

                    await StudyPlan.deleteMany({
                        "user_id": id
                    })
            
                    break
                case "teacher":
                    const deleter_user = await User.findById(req.body.user_id)
                    if(deleter_user?.usertype == "admin"){
                        await User.findByIdAndDelete(id)

                        await Tip.deleteMany({
                            "user_id": id
                        })

                        await Subject.updateMany({
                            "user_id": id
                        }, {
                           $unset: {
                                user_id: 1
                           }
                        })
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
                        subject,
                        students
                    }

                    return res.status(200).json(response)
                    break
                case "student":
                    const student = await User.aggregate([
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
                                let: {id: "$user_id", firstDay, lastDay},
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {$eq: ["$$id", "$user_id"]},
                                                {$gte: ["$date", "$$firstDay"]},
                                                {$lte: ["$date", "$$lastDay"]}
                                            ]
                                        }
                                    }
                                }],
                                as: "study_plans_info"
                            }
                        },
                        {
                            $match: {
                                _id: new ObjectId(user_id),
                                usertype: "student",
                            }
                        }
                    ])

                    const topics = await Topic.aggregate([
                        {
                            $lookup: {
                              from: 'subjects', 
                              localField: 'subject_id', 
                              foreignField: '_id', 
                              as: 'subject_info'
                            }
                        }, 
                        {
                            $unwind: {
                              path: '$subject_info', 
                              preserveNullAndEmptyArrays: true
                            }
                        }  
                    ])

                    const topicsGraph = {
                        human_completed: 0,
                        human_total: 0,
                        natural_completed: 0,
                        natural_total: 0,
                        languages_completed: 0,
                        languages_total: 0,
                        maths_completed: 0,
                        maths_total: 0
                    }

                    topics.forEach((topic: any): any => {
                        let flag: boolean = false;
                        for(let topic_completed of student[0].topics_completed){
                            if(topic_completed.toString() == topic._id.toString()){ 
                                flag = true
                                break
                            }
                        }
                        switch(topic.subject_info.area){
                            case "languages":
                                topicsGraph.languages_total++
                                if(flag)topicsGraph.languages_completed++
                                break;
                            case "mathematics":
                                topicsGraph.maths_total++
                                if(flag)topicsGraph.maths_completed++
                                break;
                            case "natural_sciences":
                                topicsGraph.natural_total++
                                if(flag)topicsGraph.natural_completed++
                                break;
                            case "human_sciences":
                                topicsGraph.human_total++
                                if(flag)topicsGraph.human_completed++
                                break;
                        }
                    })

                    response = {
                        student,
                        topicsGraph
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
        try{
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

            return res.status(200).json({
                message: "Senha alterada com sucesso",
                user
            })
        }catch(error: any){
            return res.status(400).json({
                message: error.message
            })
        }
    }

    async verifyResetToken(req: any, res: any){
        try{
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
        }catch(error: any){
            return res.status(400).json(error)
        }
    }

    async requestRecoverPassword(req: any, res: any){
        try{
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
        }catch(error: any){
            return res.status(400).json(error)
        }
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

    async addPomodoro(req: any, res: any){
        try{
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
                        const achievements = await pomodoroAchievement(user)

                        return res.status(200).json({user, achievements})
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

            const achievements = await pomodoroAchievement(user)

            return res.status(200).json({user, achievements})
        }catch(error: any){
            return res.status(400).json(error)
        }
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

    async updateXp(user: any, experience: number){
        return handlerXp(user, experience)
    }

    async getUser(req: any, res: any){
        try{
            const user_id = req.body.user_id;

            const user = await User.findById(user_id)
            let mathematics: any[] = [], languages: any[] = [], human_sciences: any[] = [], natural_sciences: any[] = []

            if(user?.usertype !== "student"){
                let teacher = await User.aggregate([
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "subject_info"
                        }
                    },
                    {
                        $match: {
                            activated: true,
                            usertype: {$in: ["teacher", "admin"]},
                            _id: new ObjectId(user_id)
                        }
                    }
                ])

                if(teacher){
                    if(teacher[0].subject_info){
                        teacher[0].subject_info.forEach((subject: any): any => {
                            switch(subject.area){
                                case "languages":
                                    languages.push(subject);
                                    break;
                                case "mathematics":
                                    mathematics.push(subject);
                                    break;
                                case "natural_sciences":
                                    natural_sciences.push(subject);
                                    break;
                                case "human_sciences":
                                    human_sciences.push(subject);
                                    break;
                            }
                        })
                    }
                }
            }

            return res.status(200).json({
                user,
                mathematics,
                languages,
                natural_sciences,
                human_sciences
            })
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
        
    }
}

export default new UserController()
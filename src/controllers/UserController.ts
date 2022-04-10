import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/UserModel";
import Student from "../models/StudentModel";
import Teacher from "../models/TeacherModel";
import Common from "../Common";

function generateToken(params = {}){
    return jsonwebtoken.sign(params, process.env.PRIVATE_KEY!.replace(/\\n/gm, '\n') as string,{
        expiresIn: 86400,
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

            await new Teacher({
                user_id: user._id
            }).save()

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
                password,
                usertype
            } = req.body;

            let creator_id = req.body.user_id

            // Verifica se os campos estão preenchidos
            if(!username || !email || !password || !usertype){
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

                    await new Teacher({
                        user_id: user._id
                    }).save()
                }
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

                // Cria o estudante
                await new Student({
                    user_id: user._id
                }).save()
            }

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
                    await Student.deleteOne({user_id: id})
                    break
                case "teacher":
                    const deleter_user = await User.findById(req.body.user_id)
                    if(deleter_user?.usertype == "admin"){
                        await User.findByIdAndDelete(id)
                        await Teacher.deleteOne({user_id: id})
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

            const actualYear = new Date().getFullYear()
            const date = new Date(actualYear)

            let response = {}

            switch(user?.usertype){
                case "admin":
                    const allStudents = await Student.count()
                    const allTeachers = await Teacher.count()
                    const newStudents = await User.aggregate([
                        {
                            $lookup: {
                                from: "Student",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "student_info"
                            }
                        },
                        {
                            $unwind: "$student_info"
                        },
                        {
                            $match: {
                                created: date,
                                usertype: "student"
                            }
                        }
                    ])
                    const newTeachers = await User.aggregate([
                        {
                            $lookup: {
                                from: "Teacher",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "teacher_info"
                            }
                        },
                        {
                            $unwind: "$teacher_info"
                        },
                        {
                            $match: {
                                created: date,
                                usertype: "teacher"
                            }
                        }
                    ])

                    response = {
                        allStudents,
                        allTeachers,
                        newStudents,
                        newTeachers
                    }

                    return res.status(200).json(response)
                    break
                case "teacher":
                    const teacher = await User.aggregate([
                        {
                            $lookup: {
                                from: "Teacher",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "teacher_info"
                            }
                        },
                        {
                            $unwind: "$teacher_info"
                        },
                        {
                            $lookup: {
                                from: "Subject",
                                localField: "subjects_id",
                                foreignField: "_id",
                                as: "subject_info"
                            }
                        },
                        {
                            $match: {
                                _id: user_id,
                                usertype: "teacher"
                            }
                        }
                    ])
                    
                    const students = await User.aggregate([
                        {
                            $lookup: {
                                from: "Student",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "student_info"
                            }
                        },
                        {
                            $unwind: "$student_info"
                        },
                        {
                            $lookup: {
                                from: "Quiz",
                                localField: "student_info.quiz_score.quiz_id",
                                foreignField: "_id",
                                as: "quiz_info"
                            }
                        },
                        {
                            $lookup: {
                                from: "MockExam",
                                localField: "student_info.mock_exams.mock_exam_id",
                                foreignField: "_id",
                                as: "quiz_info"
                            }
                        },
                        {
                            $match: {
                                created: date,
                                usertype: "student"
                            }
                        }
                    ])

                    response = {
                        teacher,
                        students
                    }

                    return res.status(200).json(response)
                    break
                case "student":
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
        let { reset_token } = req.params.reset_token

        const user = await User.findOne({password_reset_token: reset_token})

        if(!user){
            return res.status(401).json({
                message: "Token invalido"
            })
        }

        if(user.password_reset_expire! < Date.now()){
            return res.status(401).json({
                message: "Token expirado"
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
                message: "Nenhum usuario correspondente a esse email foi encontrado"
            })
        }

        const result = await Common.sendMail(email, "recover_pass", password_reset_token)

        return res.status(200).json({
            message: result
        });
    }

    async getAllUsers(req: any, res: any){
        const teachers = await User.aggregate([
            {
                $lookup: {
                    from: "teachers",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "teacher_info"
                }
            },
            {
                $unwind: "$teacher_info"
            },
            {
                $match: {
                    usertype: { 
                        $in: ["admin", "teacher"]
                    }
                }
            }
        ])
        
        const students = await User.aggregate([
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "student_info"
                }
            },
            {
                $unwind: "$student_info"
            },
            {
                $match: {
                    usertype: "student"
                }
            }
        ])

        const response = {
            teachers,
            students
        }

        return res.status(200).json(response)
    }
}

export default new UserController()
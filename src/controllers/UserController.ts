import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose, { Mongoose } from "mongoose";

import User from "../models/UserModel";
import Student from "../models/StudentModel";
import Teacher from "../models/TeacherModel";

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
                usertype
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
                        usertype
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
                    usertype
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
                        message: "Tipo de usuario não identificado"
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
}

export default new UserController()
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/userModel";
import Student from "../models/studentModel";
import Teacher from "../models/teacherModel";

function generateToken(params = {}){
    return jsonwebtoken.sign(params, process.env.PRIVATE_KEY as string,{
        expiresIn: 86400,
        algorithm: "RS256"
    });
}

module.exports = {
    async createUser (req: any, res: any){
        try{
            let { 
                username,
                email,
                password,
                usertype,
                creatorEmail
            } = req.body;

            // Verifica se os campos estão preenchidos
            if(!username || !email || !password || !usertype){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            // O primeiro usuario é o admin
            let user = await User.findOne();
            if(!user){
                usertype = "admin";
            }

            // O email precisa ser unico
            user = await User.findOne({ email });
            if(user){
                return res.status(400).json({
                    error: "Usuario já cadastrado."
                });
            }

            // Apenas o admin pode criar professores
            if(usertype == "teacher"){
                const creatorUser = await User.findOne({creatorEmail});

                if(creatorUser){
                    if(creatorUser.usertype != "admin"){
                        return res.status(400).json({
                            error: "Não autorizado."
                        });
                    }else{
                        // Cria o usuario
                        user = await new User({
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
                    return res.status(400).json({
                        error: "Usuário não encontrado, verifique se está logado"
                    });
                }
            }else{
                // Cria o usuario
                user = await new User({
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

            return res.json({
                status: 200,
                user
            });
        
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    },

    async login(req: any, res: any){
        const {email,password} = req.body;
    
        const user = await User.findOne ({email}).select('password');
    
        if(!user)
            return res.status(400).json({message: 'Usuario não cadastrado'});
    
        if(!await bcrypt.compare(password, user.password))
            return res.status(400).json({message: 'Senha incorreta'});
    
        res.send({
            user,
            token: generateToken( {id: user.id }),
        });
    }
}
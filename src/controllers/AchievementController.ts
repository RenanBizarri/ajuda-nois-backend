import Achievement from "../models/AchievementModel";

import Common from "../Common";
import User from "../models/UserModel";

class AchievementController {
    async create(req: any, res: any){
        try{
            let {
                icon_base64,
                name,
                description,
                experience,
                type,
                quantity,
                area
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!icon_base64 || !name || !description || !experience || !type || !quantity || !area){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const icon = await Common.uploadFirebase(icon_base64, 'image/jpeg', "achievement")

            const achievement = await new Achievement({
                icon, 
                name, 
                description, 
                experience,
                type,
                quantity,
                area
            }).save()

            return res.status(200).json(achievement)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async update(req: any, res: any){
        try{
            let {
                id,
                icon_base64,
                name,
                description,
                experience,
                quantity,
                area
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da conquista para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!icon_base64 && !name && !description && !experience && !quantity && !area){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let achievement = await Achievement.findById(id)

            if(!achievement){
                return res.status(400).json({
                    error: "Conquista não encontrada."
                });
            }

            if(icon_base64) {
                achievement.icon = await Common.uploadFirebase(icon_base64, 'image/jpeg', "achievement")
            }
            if(name) achievement.name = name
            if(description) achievement.description = description
            if(experience) achievement.experience = experience
            if(quantity) achievement.quantity = quantity
            if(area) achievement.area = area

            await achievement.save()

            return res.status(200).json(achievement)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async delete(req: any, res: any){
        try{
            let {
                id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da conquista para excluir"
                });
            }
    
            await Achievement.findByIdAndDelete(id)

            await User.updateMany({
                "achievements.achievement_id": id
            }, {
                $pull: {"achievements": {"achievement_id": id}}
            })
    
            return res.status(200).json({
                message: "Conquista excluida"
            })
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findAll(req: any, res: any){
        try{
            const user_id = req.body.user_id

            const user = await User.findById(user_id);
            const achievement = await Achievement.find({})

            return res.status(200).json({user, achievement})
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new AchievementController()
import Tip from "../models/TipModel";

class TipController {
    async create(req: any, res: any){
        try{
            let {
                name,
                information,
                user_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!name || !information || !user_id){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            const tip = await new Tip({
                name, 
                information, 
                user_id
            }).save()

            return res.status(200).json(tip)

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
                name,
                information
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da anotação para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!name && !information){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let tip = await Tip.findById(id)

            if(!tip){
                return res.status(400).json({
                    error: "Anotação não encontrada."
                });
            }

            if(name) tip.name = name
            if(information) tip.information = information

            await tip.save()

            return res.status(200).json(tip)

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
                    error: "Sem id da anotação para excluir"
                });
            }
    
            await Tip.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Anotação excluida"
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
            const tips = await Tip.find({})

            return res.status(200).json(tips)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findByUser(req: any, res:any){
        try{
            const user_id = req.body.user_id
            const tips = await Tip.find({user_id})

            return res.status(200).json(tips)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new TipController()
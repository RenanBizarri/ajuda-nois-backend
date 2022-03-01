import Tip from "../models/TipModel";

class TipController {
    async create(req: any, res: any){
        try{
            let {
                topic,
                information,
                teacher_id,
                color
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!topic || !information || !teacher_id){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            const tip = await new Tip({
                topic, 
                information, 
                teacher_id, 
                color
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
                topic,
                information,
                color
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da anotação para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!topic && !information && !color){
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

            if(topic) tip.topic = topic
            if(information) tip.information = information
            if(color) tip.color = color

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
            const tip = await Tip.find({})

            return res.status(200).json(tip)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new TipController()
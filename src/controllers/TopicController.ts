import Topic from "../models/TopicModel";
class TopicController {
    async create(req: any, res: any){
        try{
            let {
                name,
                subject_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!name || !subject_id){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            const topic = await new Topic({
                name, 
                subject_id
            }).save()

            return res.status(200).json(topic)

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
                subject_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Tópico para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!name && !subject_id){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let topic = await Topic.findById(id)

            if(!topic){
                return res.status(400).json({
                    error: "Tópico não encontrado."
                });
            }

            let file
            if(name) topic.name = name
            if(subject_id) topic.subject_id = subject_id

            await topic.save()

            return res.status(200).json(topic)

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
                    error: "Sem id da matéria para excluir"
                });
            }
    
            await Topic.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Tópico excluido"
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
            const topic = await Topic.find({})

            return res.status(200).json(topic)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new TopicController()
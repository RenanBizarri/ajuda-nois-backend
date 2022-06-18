import Subject from "../models/SubjectModel";
class SubjectController {
    async create(req: any, res: any){
        try{
            let {
                name,
                area,
                user_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!name || !area){
                return res.status(400).json({
                    error: "Campos obrigatórios não preenchidos."
                });
            }

            const subject = new Subject({
                name, 
                area, 
                user_id
            })

            await subject.save()

            return res.status(200).json(subject)

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
                area,
                user_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Matéria para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!name && !area && !user_id){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let subject = await Subject.findById(id)

            if(!subject){
                return res.status(400).json({
                    error: "Matéria não encontrada."
                });
            }

            if(name) subject.name = name
            if(area) subject.area = area
            if(user_id) {
                subject.user_id = user_id
            }

            await subject.save()

            return res.status(200).json(subject)

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
    
            await Subject.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Matéria excluida"
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
            const subject = await Subject.aggregate([
                {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'user_id', 
                    'foreignField': '_id', 
                    'as': 'user_info'
                  }
                }, 
                {
                  '$unwind': {
                    'path': '$user_info', 
                    'preserveNullAndEmptyArrays': true
                  }
                }
              ])

            return res.status(200).json(subject)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new SubjectController()
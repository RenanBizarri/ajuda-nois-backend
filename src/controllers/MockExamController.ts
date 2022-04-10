import MockExam from "../models/MockExamModel";
class MockExamController {
    async create(req: any, res: any){
        try{
            let {
                date,
                template_64
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!date || !template_64){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            const csv_buffer = Buffer.from(template_64, 'base64')

            

            const mockExam = await new MockExam({
                date, 
            }).save()

            return res.status(200).json(mockExam)

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
                date,
                template
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Tópico para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!date && !template){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let mockExam = await MockExam.findById(id)

            if(!mockExam){
                return res.status(400).json({
                    error: "Tópico não encontrado."
                });
            }

            if(date) mockExam.date = date
            if(template) mockExam.template = template

            await mockExam.save()

            return res.status(200).json(mockExam)

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
    
            await MockExam.findByIdAndDelete(id)
    
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
            const mockExams = await MockExam.find({})

            return res.status(200).json(mockExams)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new MockExamController()
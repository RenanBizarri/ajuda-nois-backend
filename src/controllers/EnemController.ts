import Common from "../Common";
import Enem from "../models/EnemModel";
class EnemController {
    async create(req: any, res: any){
        try{
            let {
                year,
                exam_base64,
                template_base64,
                color
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!year || !exam_base64 || !template_base64){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            let file = await Common.uploadFirebase(exam_base64, 'application/pdf', "enem_exam")
            const exam = file
            file = await Common.uploadFirebase(template_base64, 'application/pdf', "enem_template")
            const template = file

            const enem = await new Enem({
                year, 
                exam, 
                template,
                color
            }).save()

            return res.status(200).json(enem)

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
                year,
                exam_base64,
                template_base64,
                color
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do ENEM para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!year && !exam_base64 && !template_base64 && !color){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let enem = await Enem.findById(id)

            if(!enem){
                return res.status(400).json({
                    error: "ENEM não encontrado."
                });
            }

            let file
            if(year) enem.year = year
            if(exam_base64){
                file = await Common.uploadFirebase(exam_base64, 'application/pdf', "enem_exam")
                enem.exam = file
            } 
            if(template_base64){
                file = await Common.uploadFirebase(template_base64, 'application/pdf', "enem_template")
                enem.template = file
            } 
            if(color) enem.color = color

            await enem.save()

            return res.status(200).json(enem)

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
                    error: "Sem id do ENEM para excluir"
                });
            }
    
            await Enem.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "ENEM excluido"
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
            const enem = await Enem.find({})

            return res.status(200).json(enem)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new EnemController()
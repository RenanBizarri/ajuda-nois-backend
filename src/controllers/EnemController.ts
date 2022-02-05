import Enem from "../models/enemModel";

module.exports = {
    async create(req: any, res: any){
        try{
            let {
                year,
                exam,
                template
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!year || !exam || !template){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            const enem = await new Enem({
                year, 
                exam, 
                template
            }).save()

            return res.status(200).json(enem)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    },

    async update(req: any, res: any){
        try{
            let {
                id,
                year,
                exam,
                template
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do ENEM para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!year && !exam && !template){
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

            if(year) enem.year = year
            if(exam) enem.exam = exam
            if(template) enem.template = template

            await enem.save()

            return res.status(200).json(enem)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    },

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
    },

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
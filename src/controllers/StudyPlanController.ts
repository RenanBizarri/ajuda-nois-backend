import StudyPlan from "../models/StudyPlanModel";

class StudyPlanController {
    async create(req: any, res: any){
        try{
            let {
                user_id,
                studies,
                date
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!user_id || !studies || !date){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const studyPlan = await new StudyPlan({
                user_id,
                studies,
                date
            }).save()

            return res.status(200).json(studyPlan)

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
                studies,
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do quiz para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!studies){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            let studyPlan = await StudyPlan.findById(id)

            if(!studyPlan){
                return res.status(400).json({
                    error: "Plano de estudo não encontrado."
                });
            }

            if(studies) studyPlan.studies = studies

            await studyPlan.save()

            return res.status(200).json(studyPlan)

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
                    error: "Sem id do plano para excluir"
                });
            }
    
            await StudyPlan.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Plano de estudo excluido"
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
            const {
                user_id,
                begin,
                end
            } = req.body
            const studyPlan = await StudyPlan.find({user_id, date: {$gte: begin, $lte: end}})

            return res.status(200).json(studyPlan)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new StudyPlanController()
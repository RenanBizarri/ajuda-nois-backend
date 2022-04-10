import Quiz from "../models/QuizModel";

class QuizController {
    async create(req: any, res: any){
        try{
            let {
                name,
                topic_id,
                questions_ids
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!name || !topic_id || !questions_ids){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const quiz = await new Quiz({
                name,
                topic_id,
                questions_ids
            }).save()

            return res.status(200).json(quiz)

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
                topic_id,
                questions_ids
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do quiz para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!name || !topic_id || !questions_ids){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            let quiz = await Quiz.findById(id)

            if(!quiz){
                return res.status(400).json({
                    error: "Quiz não encontrado."
                });
            }

            if(name) quiz.name = name
            if(topic_id) quiz.topic_id = topic_id
            if(questions_ids) quiz.questions_ids = questions_ids

            await quiz.save()

            return res.status(200).json(quiz)

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
                    error: "Sem id do quiz para excluir"
                });
            }
    
            await Quiz.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Quiz excluido"
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
            const quiz = await Quiz.find({})

            return res.status(200).json(quiz)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new QuizController()
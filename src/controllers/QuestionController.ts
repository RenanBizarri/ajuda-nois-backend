import Question from "../models/QuestionModel";
import Quiz from "../models/QuizModel";

class QuestionController {
    async create(req: any, res: any){
        try{
            let {
                questionHtml,
                alternatives,
                answer,
                topic_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!questionHtml || !alternatives || !answer || !topic_id){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const question = await new Question({
                question: questionHtml,
                alternatives,
                answer,
                topic_id
            }).save()

            return res.status(200).json(question)

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
                questionHtml,
                alternatives,
                answer,
                topic_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da questão para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!questionHtml && !alternatives && !answer && !topic_id){
                return res.status(400).json({
                    error: "Não há campos para atualizar."
                });
            }

            let question = await Question.findById(id)

            if(!question){
                return res.status(400).json({
                    error: "Questão não encontrada."
                });
            }

            if(questionHtml) question.question = questionHtml
            if(alternatives) question.alternatives = alternatives
            if(answer) question.answer = answer
            if(topic_id) question.topic_id = topic_id

            await question.save()

            return res.status(200).json(question)

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
                    error: "Sem id da questão para excluir"
                });
            }
    
            await Question.findByIdAndDelete(id)

            await Quiz.updateMany({
                "questions_id": id
            }, {
                $pull: {"questions_id": id}
            })
    
            return res.status(200).json({
                message: "Questão excluida"
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
            const questions = await Question.aggregate([
                {
                    '$lookup': {
                      'from': 'topics', 
                      'localField': 'topic_id', 
                      'foreignField': '_id', 
                      'as': 'topic_info'
                    }
                  }, 
                  {
                    '$unwind': {
                      'path': '$topic_info', 
                      'preserveNullAndEmptyArrays': true
                    }
                  }
            ])
            return res.status(200).json(questions)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findByTopic(req: any, res: any){
        try{
            const {
                topic_id
            } = req.body
            const questions = await Question.find({topic_id})

            return res.status(200).json(questions)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new QuestionController()
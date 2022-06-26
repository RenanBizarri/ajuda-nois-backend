import Quiz from "../models/QuizModel";
import User from "../models/UserModel";

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

            await User.updateMany({
                "quiz_score.quiz_id": id
            }, {
                $pull: {"quiz_score": {"quiz_id": id}}
            })
    
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

    async finishQuiz(req: any, res: any){
        try{
            const {
                user_id,
                quiz_id,
                awnsers
            } = req.body

            let user = await User.findById(user_id)

            if(user){
                let quizFlag: boolean = false

                if(user.quiz_score){
                    user.quiz_score.forEach(function (quiz) {
                        if(quiz.quiz_id == quiz_id) quizFlag = true
                    })
                }

                if(quizFlag){
                    return res.status(200).json({
                        message: "Quiz já realizado"
                    });
                }else{
                    const date: string = new Date().toISOString().substring(0, 10)
                    let score = 0;
                    const quiz = await Quiz.aggregate([
                        {
                            $lookup: {
                                from: "questions",
                                localField: "questions_ids",
                                foreignField: "_id",
                                as: "questions_info"
                            }
                        },
                        {
                            $match: {
                                _id: quiz_id,
                            }
                        }
                    ])

                    if(quiz[0]){
                        if(quiz[0].questions_info){
                            let i = 0
                            quiz[0].questions_info.forEach(function (question: any) {
                                if(question.awnser === awnsers[i]) score++;
                                i++
                            });
                        }
                    }else{
                        return res.status(401).json({
                            error: "Quiz não encontrado"
                        });
                    }

                    const quiz_score = {
                        quiz_id,
                        date,
                        score,
                        awnsers
                    }

                    if(user.quiz_score){
                        user.quiz_score.push(quiz_score)
                    }else{
                        user.quiz_score = [quiz_score]
                    }
                    await user.save()
                }

            }else{
                return res.status(401).json({
                    error: "Usuario não encontrado"
                });
            }

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new QuizController()
import { ObjectId } from "mongodb";
import Common from "../Common";
import Quiz from "../models/QuizModel";
import User from "../models/UserModel";
import TopicController from "./TopicController";
import UserController from "./UserController";

async function quizAchievement(user: any, quiz: any) {
    try{
        let achievements = await Common.findAchievementMissing(user, ["quiz_completed"])
        let achievementsGained: any[] = [], experience: number = 0

        if(achievements.length > 0){
            console.log(quiz)
            const subject_area = quiz.subject_info.area
            const adiquired = new Date().toISOString().substring(0, 10)
            let quizzes_id: any[] = []

            user.quiz_score.forEach((quiz_completed: any): any => {
                quizzes_id.push(quiz_completed.quiz_id)
            })

            const quizzes_completed = await Quiz.aggregate([
                {
                    $lookup: {
                        from: "topics",
                        localField: "topic_id",
                        foreignField: "_id",
                        as: "topic_info"
                    }
                },
                {
                    $unwind: {
                      path: '$topic_info', 
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "subjects",
                        localField: "topic_info.subject_id",
                        foreignField: "_id",
                        as: "subject_info"
                    }
                },
                {
                    $unwind: {
                      path: '$subject_info', 
                      preserveNullAndEmptyArrays: true
                    }
                },
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
                        _id: {
                            $in: quizzes_id
                        },
                    }
                }
            ])

            const quiz_completed_total: number = quizzes_id.length
            let quiz_completed_area: number = 0

            quizzes_completed.forEach((quiz_completed: any): any => {
                if(quiz_completed.subject_info.area === subject_area) quiz_completed_area++
            })
            
            achievements.forEach((achievement: any): any => {
                const newAchievement = {
                    achievement_id: achievement._id,
                    adiquired
                }
                if(achievement.area === "general"){
                    if(quiz_completed_total >= achievement.quantity){
                        user.achievements.push(newAchievement)
                        achievementsGained.push(achievement)
                        experience += achievement.experience
                    }
                }else if(achievement.area === subject_area){
                    if(quiz_completed_area >= achievement.quantity){
                        user.achievements.push(newAchievement)
                        achievementsGained.push(achievement)
                        experience += achievement.experience
                    }
                }
            })

            await user.save()

            if(experience > 0) achievementsGained = achievementsGained.concat(await UserController.updateXp(user, experience)) 
        }

        return achievementsGained
    }catch(error: any){
        return error.message
    }
}

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
            const quiz = await Quiz.aggregate([
                {
                    $lookup: {
                      from: 'topics', 
                      localField: 'topic_id', 
                      foreignField: '_id', 
                      as: 'topic_info'
                    }
                  }, 
                  {
                    $unwind: {
                      path: '$topic_info', 
                      preserveNullAndEmptyArrays: true
                    }
                  }
            ])

            return res.status(200).json(quiz)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findOne(req: any, res: any){
        try{
            const quiz_id = req.body.quiz_id
            const quiz = await Quiz.aggregate([
                {
                    $lookup: {
                      from: 'topics', 
                      localField: 'topic_id', 
                      foreignField: '_id', 
                      as: 'topic_info'
                    }
                }, 
                    {
                    $unwind: {
                        path: '$topic_info', 
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "questions_ids",
                        foreignField: "_id",
                        as: "questions_info"
                    }
                },
                {
                    "$project": {
                      "_id": 1,
                      "name": 1,
                      "topic_info._id": 1,
                      "topic_info.name": 1,
                      "topic_info.subject_id": 1,
                      "questions_info._id": 1,
                      "questions_info.name": 1,
                      "questions_info.question": 1,
                      "questions_info.alternatives": 1
                    }
                },
                {
                    $match: {
                        _id: new ObjectId(quiz_id)
                    }
                }
            ])
            return res.status(200).json(quiz[0])
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
                answers
            } = req.body

            let user = await User.findById(user_id)
            let achievements: any[] = []

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
                                from: "topics",
                                localField: "topic_id",
                                foreignField: "_id",
                                as: "topic_info"
                            }
                        },
                        {
                            $unwind: {
                              path: '$topic_info', 
                              preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: "subjects",
                                localField: "topic_info.subject_id",
                                foreignField: "_id",
                                as: "subject_info"
                            }
                        },
                        {
                            $unwind: {
                              path: '$subject_info', 
                              preserveNullAndEmptyArrays: true
                            }
                        },
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
                                _id: new ObjectId(quiz_id),
                            }
                        }
                    ])

                    console.log(quiz)

                    if(quiz[0]){
                        if(quiz[0].questions_info){
                            let i = 0
                            quiz[0].questions_info.forEach(function (question: any) {
                                if(question.answer == answers[i]) score++;
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
                        answers
                    }

                    if(user.quiz_score){
                        user.quiz_score.push(quiz_score)
                    }else{
                        user.quiz_score = [quiz_score]
                    }
                    await user.save()

                    achievements = achievements.concat(await TopicController.topicAchievement(user, null, quiz_id))
                    achievements = achievements.concat(await quizAchievement(user, quiz[0]))

                    return res.status(200).json({
                        message: "Quiz salvo",
                        quiz_score, 
                        achievements
                    });
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
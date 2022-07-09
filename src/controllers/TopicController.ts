import Lesson from "../models/LessonModel";
import Question from "../models/QuestionModel";
import Quiz from "../models/QuizModel";
import StudyPlan from "../models/StudyPlanModel";
import Topic from "../models/TopicModel";
import User from "../models/UserModel";
import { ObjectId } from "mongodb";
import Common from "../Common";
import UserController from "./UserController";

async function findLessonsAndQuizzes(topic_id: ObjectId){
    return await Topic.aggregate([
        {
            $lookup: {
              from: 'subjects', 
              localField: 'subject_id', 
              foreignField: '_id', 
              as: 'subject_info'
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
                from: "lessons",
                localField: "_id",
                foreignField: "topic_id",
                as: "lessons"
            }
        },
        {
            $lookup: {
                from: "quizzes",
                localField: "_id",
                foreignField: "topic_id",
                as: "quizzes"
            }
        },
        {
            $match: {
                _id: new ObjectId(topic_id)
            }
        }
    ])
}
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

            await Question.deleteMany({
                topic_id: id
            })

            await Quiz.deleteMany({
                topic_id: id
            })

            await Lesson.deleteMany({
                topic_id: id
            })

            await StudyPlan.updateMany({
                "studies.topic_id": id
            }, {
                $pull: {"studies": {"topic_id": id}}
            })
    
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
            const topic = await Topic.aggregate([
                {
                    $lookup: {
                      from: 'subjects', 
                      localField: 'subject_id', 
                      foreignField: '_id', 
                      as: 'subject_info'
                    }
                }, 
                {
                    $unwind: {
                      path: '$subject_info', 
                      preserveNullAndEmptyArrays: true
                    }
                }  
            ])

            return res.status(200).json(topic)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findBySubject(req: any, res: any){
        try{
            const subject_id = req.body.subject_id

            const topic = await Topic.aggregate([
                {
                    $lookup: {
                      from: 'subjects', 
                      localField: 'subject_id', 
                      foreignField: '_id', 
                      as: 'subject_info'
                    }
                }, 
                {
                    $unwind: {
                      path: '$subject_info', 
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        subject_id: new ObjectId(subject_id)
                    }
                }
            ])

            return res.status(200).json(topic)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async getLessonsAndQuizzes(req: any, res: any){
        try{
            const {
                topic_id
            } = req.body
            const topic = await findLessonsAndQuizzes(topic_id)

            return res.status(200).json(topic)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async topicAchievement(user: any, lesson_id: any, quiz_id: any){
        try{
            let achievements: any[] = await Common.findAchievementMissing(user, ["topics_completed"])
            let achievementsGained: any[] = [], experience: number = 0
            let lesson: any, quiz: any;

            if(lesson_id){
                lesson = await Lesson.findById(lesson_id)
            }else{
                quiz = await Quiz.findById(quiz_id)
            }

            const topic_id = lesson_id ? lesson?.topic_id : quiz?.topic_id

            const alreadyCompleted: any[] = user.topics_completed.filter((topic_completed: any): any => {
                topic_completed === topic_id
            })

            if(alreadyCompleted.length === 0){
                const topics: any[] = await findLessonsAndQuizzes(topic_id!)
                let flag: boolean = true

                for(let lesson_viewed of user.lessons_viewed){
                    const filter = topics[0].lessons.filter((lesson: any): any => {
                        lesson._id === lesson_viewed.lesson_id
                    })
                    if(!filter){
                        flag = false
                        break
                    }
                }

                if(flag){
                    for(let quiz_done of user.quiz_score){
                        const filter = topics[0].quizzes.filter((quiz: any): any => {
                            quiz._id === quiz_done.quiz_id
                        })
                        if(!filter){
                            flag = false
                            break
                        }
                    }

                    if(flag){
                        user.topics_completed.push(topic_id)
                        
                        if(achievements.length > 0){
                            const subject_area = topics[0].subject_info.area
                            const adiquired = new Date().toISOString().substring(0, 10)

                            let area_topics = 0
                            const total_topics = user.topics_completed.length

                            const completedTopics = await Topic.aggregate([
                                {
                                    $lookup: {
                                    from: 'subjects', 
                                    localField: 'subject_id', 
                                    foreignField: '_id', 
                                    as: 'subject_info'
                                    }
                                }, 
                                {
                                    $unwind: {
                                    path: '$subject_info', 
                                    preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $match: {
                                        _id: {
                                            $in: user.topics_completed
                                        }
                                    }
                                }
                            ])

                            completedTopics.forEach((completedTopic: any) => {
                                if(completedTopic.subject_info.area === subject_area) area_topics++
                            })

                            achievements.forEach((achievement: any): any => {
                                const newAchievement = {
                                    achievement_id: achievement._id,
                                    adiquired
                                }
                                if(achievement.area === "general"){
                                    if(total_topics >= achievement.quantity){
                                        user.achievements.push(newAchievement)
                                        achievementsGained.push(achievement)
                                        experience += achievement.experience
                                    }
                                }else if(achievement.area === subject_area){
                                    if(area_topics >= achievement.quantity){
                                        user.achievements.push(newAchievement)
                                        achievementsGained.push(achievement)
                                        experience += achievement.experience
                                    }
                                }
                            })
                        }

                        await user.save()
                    }
                }

                if(experience > 0) achievementsGained = achievementsGained.concat(await UserController.updateXp(user, experience)) 
            }

            return achievementsGained
        }catch(error: any){
            return error.message
        }
    }
}

export default new TopicController()
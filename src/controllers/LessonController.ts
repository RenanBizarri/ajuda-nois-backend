import { ObjectId } from "mongodb";
import Lesson from "../models/LessonModel";
import User from "../models/UserModel";
import TopicController from "./TopicController";

class LessonController {
    async create(req: any, res: any){
        try{
            let {
                title,
                content,
                topic_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!title || !content  || !topic_id){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const lesson = await new Lesson({
                title,
                content,
                topic_id
            }).save()

            return res.status(200).json(lesson)

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
                title,
                content,
                topic_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da aula para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!title && !content  && !topic_id){
                return res.status(400).json({
                    error: "Não há campos para atualizar"
                });
            }

            let lesson = await Lesson.findById(id)

            if(!lesson){
                return res.status(400).json({
                    error: "Aula não encontrada."
                });
            }

            if(title) lesson.title = title
            if(content) lesson.content = content
            if(topic_id) lesson.topic_id = topic_id

            await lesson.save()

            return res.status(200).json(lesson)

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
                    error: "Sem id da aula para excluir"
                });
            }
    
            await Lesson.findByIdAndDelete(id)

            await User.updateMany({
                "lessons_viewed.lesson_id": id
            }, {
                $pull: {"lessons_viewed": {"lesson_id": id}}
            })
    
            return res.status(200).json({
                message: "Aula excluida"
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
            const lesson = await Lesson.aggregate([
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
            return res.status(200).json(lesson)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findOne(req: any, res: any){
        try{
            const lesson_id = req.body.lesson_id
            const lesson = await Lesson.aggregate([
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
                    $match: {
                        _id: new ObjectId(lesson_id)
                    }
                }
            ])
            return res.status(200).json(lesson)
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
            const lesson = await Lesson.find({topic_id})

            return res.status(200).json(lesson)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async lessonViewned(req: any, res: any){
        try{
            const {
                user_id,
                lesson_id
            } = req.body

            let user = await User.findById(user_id)
            let achievements: any[] = []

            if(user){
                let viewedFlag: boolean = false

                if(user.lessons_viewed){
                    user.lessons_viewed.forEach(function (lesson: any) {
                        if(lesson.lesson_id == lesson_id) viewedFlag = true
                    })
                }

                if(viewedFlag){
                    return res.status(200).json({
                        message: "Aula já assistida"
                    })
                }else{
                    const date: string = new Date().toISOString().substring(0, 10)
                    const lesson_viewed = {
                        lesson_id,
                        date
                    }

                    if(user.lessons_viewed){
                        user.lessons_viewed.push(lesson_viewed)
                    }else{
                        user.lessons_viewed = [lesson_viewed]
                    }
                    await user.save()

                    achievements = achievements.concat(await TopicController.topicAchievement(user, lesson_id, null))

                    return res.status(200).json({
                        message: "Aula adicionada as assistidas",
                        achievements
                    })
                }
            }else{
                return res.status(400).json({
                    error: "Usuario não encontrado"
                })
            }

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new LessonController()
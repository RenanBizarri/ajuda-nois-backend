import Lesson from "../models/LessonModel";
import User from "../models/UserModel";

class LessonController {
    async create(req: any, res: any){
        try{
            let {
                title,
                content,
                subject_id,
                topic_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!title || !content || !subject_id || !topic_id){
                return res.status(400).json({
                    error: "Preencha todos os campos."
                });
            }

            const lesson = await new Lesson({
                title,
                content,
                subject_id,
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
                subject_id,
                topic_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id da aula para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!title || !content || !subject_id || !topic_id){
                return res.status(400).json({
                    error: "Preencha todos os campos."
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
            if(subject_id) lesson.subject_id = subject_id
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
            const lesson = await Lesson.find({})

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

                    return res.status(200).json({
                        message: "Aula adicionada as assistidas"
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
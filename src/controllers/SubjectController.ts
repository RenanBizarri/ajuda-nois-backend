import Subject from "../models/SubjectModel";
import Teacher from "../models/TeacherModel";
class SubjectController {
    async create(req: any, res: any){
        try{
            let {
                name,
                area,
                teacher_id
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!name || !area){
                return res.status(400).json({
                    error: "Campos obrigatórios não preenchidos."
                });
            }

            const subject = new Subject({
                name, 
                area, 
                teacher_id
            })

            if(teacher_id){
                let teacher = await Teacher.findById(teacher_id)

                if(teacher){
                    if(teacher.subjects_id) {
                        teacher.subjects_id.push(subject._id)
                    }else{
                        teacher.subjects_id = [subject._id]
                    }
                    await teacher.save()
                }else{
                    return res.status(400).json({
                        error: "Professor não encontrado"
                    });
                }
            }

            await subject.save()

            return res.status(200).json(subject)

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
                area,
                teacher_id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Matéria para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!name && !area && !teacher_id){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let subject = await Subject.findById(id)

            if(!subject){
                return res.status(400).json({
                    error: "Matéria não encontrada."
                });
            }

            if(name) subject.name = name
            if(area) subject.area = area
            if(teacher_id){
                let teacher = await Teacher.findById(teacher_id)

                if(teacher){
                    subject.teacher_id = teacher_id

                    if(teacher.subjects_id) {
                        teacher.subjects_id.push(subject._id)
                    }else{
                        teacher.subjects_id = [subject._id]
                    }
                    teacher.save()
                }else{
                    return res.status(400).json({
                        error: "Professor não encontrado"
                    });
                }
            }

            await subject.save()

            return res.status(200).json(subject)

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
    
            await Subject.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Matéria excluida"
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
            const subject = await Subject.aggregate([
                {
                  '$lookup': {
                    'from': 'teachers', 
                    'localField': 'teacher_id', 
                    'foreignField': '_id', 
                    'as': 'teacher_info'
                  }
                }, 
                {
                  '$unwind': {
                    'path': '$teacher_info', 
                    'preserveNullAndEmptyArrays': true
                  }
                },
                {
                    '$lookup': {
                      'from': 'users', 
                      'localField': 'teacher_info.user_id', 
                      'foreignField': '_id', 
                      'as': 'user_info'
                    }
                  }, {
                    '$unwind': {
                      'path': '$user_info', 
                      'preserveNullAndEmptyArrays': true
                    }
                  }
              ])

            return res.status(200).json(subject)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new SubjectController()
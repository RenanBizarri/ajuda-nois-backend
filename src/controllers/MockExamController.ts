import MockExam from "../models/MockExamModel";
import Subject from "../models/SubjectModel";
import User from "../models/UserModel";
import Common from "../Common";
import { ObjectId } from "mongodb";

async function getSubjects() {
    const all_subjects = await Subject.find({})
    let subjects_names: any = [], subjects_ids: any = [], subjects_area: any = []
    all_subjects.forEach(subject => {
        subjects_ids.push(subject._id)
        subjects_names.push(subject.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
        subjects_area.push(subject.area)
    })
    return {subjects_names, subjects_ids, subjects_area}
}

function readOfficialTemplate(base64: string, subjects_names: Array<string>, subjects_ids: Array<ObjectId>, subjects_area: Array<string>){
    let official_template: any = [], subjects: any = [], questionSubjectAreas: any = [], error_flag = 0, error_info: any = {}

    let sheet_data = Common.XlsxToJson(base64)

    const possibleAnwsers = ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"]

    for(let i = 0; i < sheet_data.length; i++){
        const row: any = sheet_data[i]
        if(row.Resposta && row.Resposta != "" && row.Matéria && row.Matéria != ""){
            const index: number = subjects_names.indexOf(row.Matéria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
            if(index >= 0){
                if(possibleAnwsers.includes(row.Resposta)){
                    official_template.push(row.Resposta)
                    subjects.push(subjects_ids[index])
                    questionSubjectAreas.push(subjects_area[index])
                }else{
                    error_flag = 7
                    error_info['question'] = i+1
                    break
                }
            }else{
                // Caso não encontre uma matéria no banco retorna erro
                error_flag = 1
                error_info["subject"] = row.Matéria
                break
            }
        }else{
            // Se houver campos em branco retorna erro
            error_flag = 2
            break
        }
    }

    if(official_template.length != 185 && error_flag === 0){
        error_flag = 5
        error_info['quantity'] = official_template.length
    }

    return {
        official_template, 
        subjects, 
        questionSubjectAreas,
        error_flag, 
        error_info
    }
}

async function insertOrUpdateStudentsTemplate(base64: string, mockExam: any, subjects_area: any){
    let  error_flag = 0, error_info: any = {}, invalid_emails: any = []

    const sheet_data = Common.XlsxToJson(base64)

    let students_email = []
    for(let i = 0; i < sheet_data.length; i++){
        const row: any = sheet_data[i]
        students_email.push(row.Emails)
    } 

    const students = await User.aggregate([
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "user_id",
                as: "student_info"
            }
        },
        {
            $unwind: "$student_info"
        },
        {
            $match: {
                activated: true,
                usertype: "student",
                email: {$in: students_email}
            }
        }
    ])

    const possibleAnwsers = ["", "a", "b", "c", "d", "e", "A", "B", "C", "D", "E"]
    const template = mockExam.template
    console.log(sheet_data)

    for(let i = 0; i < sheet_data.length; i++){
        const row: any = sheet_data[i]
        let student_template = [], humanScore = 0, natureScore = 0, mathScore = 0, languageScore = 0
        for(let question in row){
            const questionNumber = Number(question)
            if(question != 'Emails' && questionNumber > 0 && questionNumber < 186) {
                const awnser = row[question]
                console.log(awnser, possibleAnwsers.includes(awnser))
                if(possibleAnwsers.includes(awnser)){
                    student_template.push(awnser)
                    if(template[questionNumber-1] === awnser){
                        switch(subjects_area[questionNumber-1]){
                            case "humanScience":
                                humanScore++
                                break
                            case "language":
                                languageScore++
                                break
                            case "mathematic":
                                mathScore++
                                break
                            case "naturalScience":
                                natureScore++
                                break
                            default: 
                                break
                        }
                    }
                }else{
                    error_flag = 3
                    error_info['email'] = row.Emails
                    error_info['question'] = question
                    break
                }
            }
        }

        // Se não houver mais de 185 ou menos de 180 questões 
        if(student_template.length != 185 || error_flag > 0){
            if(error_flag == 0) error_flag = 4
            error_info['email'] = row.Emails
            error_info['quantity'] = student_template.length
            break
        }

        let studentFlag = 0
        for(let student of students){
            if(student.email == row.Emails){
                studentFlag = 1
                let mockflag = 0
                for(let studentMockExam of student.student_info.mock_exams){
                    if(studentMockExam.mock_exam_id == mockExam._id){
                        mockflag = 1;
                        studentMockExam.template = student_template
                        studentMockExam.human_sciences_score = humanScore
                        studentMockExam.natural_sciences_score = natureScore
                        studentMockExam.languages_score = languageScore
                        studentMockExam.mathematics_score = mathScore
                        break
                    }
                }
                if(mockflag == 0){
                    student.student_info.mock_exams.push({
                        mock_exam_id: mockExam._id,
                        template: student_template,
                        humanScienceScore: humanScore,
                        naturalScienceScore: natureScore,
                        languageScore: languageScore,
                        mathematicScore: mathScore
                    })
                }
                student.save()
                break
            }
        }
        
        // Se não achou o estudante salva para notificar o usuario
        if(studentFlag == 0){
            error_flag = -1
            invalid_emails.push(row.Emails)
        }
    }

    return {error_flag, error_info, invalid_emails}
}

function errorHub(error_flag: number, error_info: any, invalid_emails: Array<string>){
    let error_message = ""
    switch(error_flag){
        case -1:
            error_message = `Simulado criado com sucesso, mas os seguintes emails ${invalid_emails} não foram achados no sistema, Verifique novamente e tente atualizar o simulado para adicionar os gabaritos deles novamente`
            break
        case 1:
            error_message = `Máteria não encontrada: ${error_info['subject']}`
            break
        case 2:
            error_message = "Gabarito oficial incompleto"
            break
        case 3:
            error_message = `A resposta da questão ${error_info['question']} do ${error_info['email']} não é valida, use somente as letra de A a E para o gabarito ou deixe em branco caso não tenha sido respondida`
            break
        case 4:
            error_message = `O gabarito do estudante ${error_info['email']} não possui 185 questões, possui ${error_info['quantity']}`
            break
        case 5:
            error_message = `O gabarito oficial do simulado não possui 185 questões, possui ${error_info['quantity']}`
            break
        case 6:
            error_message = "Já existe no sistema outro simulado com essa data"
            break
        case 7:
            error_message = `A resposta da questão ${error_info['question']} do gabarito oficial não é valida, use somente as letra de A a E para o gabarito`
            break
        default:
            error_message = "Algo deu errado, verifique os arquivos e tente de novo"
            break
    }

    return error_message
}

class MockExamController {
    async create(req: any, res: any){
        try{
            let {
                date,
                template_64,
                students_template_64
            } = req.body

            console.log("+++++1++++")

            // Verifica se os campos estão preenchidos
            if(!date || !template_64 || !students_template_64){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            // Pega os dados das matérias
            let {
                subjects_names,
                subjects_ids,
                subjects_area
            } = await getSubjects()

            console.log("+++++2++++")

            let official_template: any = [], subjects: any = [], questionSubjectAreas: any = [], error_flag = 0, error_info: any = {}, invalid_emails: any = []

            let mockExam = await MockExam.findOne({date})

            if(mockExam) error_flag = 6

            console.log("+++++3++++")

            if(error_flag === 0){
                let values = readOfficialTemplate(template_64, subjects_names, subjects_ids, subjects_area) 
                official_template = values.official_template
                subjects = values.subjects
                questionSubjectAreas = values.questionSubjectAreas
                error_flag = values.error_flag
                error_info = values.error_info

                console.log("+++++4++++")
                
                if(error_flag === 0){
                    mockExam = await new MockExam({
                        date, 
                        template: official_template,
                        questions_subject: subjects
                    }).save()

                    let studentValues = await insertOrUpdateStudentsTemplate(students_template_64, mockExam, questionSubjectAreas)

                    error_flag = studentValues.error_flag
                    error_info = studentValues.error_info
                    invalid_emails = studentValues.invalid_emails

                    console.log("+++++5++++")
                }
            }

            if(error_flag != 0){
                const error_message = errorHub(error_flag, error_info, invalid_emails)

                console.log("+++++6++++")

                return res.status(400).json({
                    error: error_message
                })
            }else{
                console.log("+++++7++++")

                return res.status(200).json(mockExam)
            }

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
                date,
                template_64,
                students_template_64
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do Tópico para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!date && !template_64 && !students_template_64){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let mockExam = await MockExam.findById(id)

            if(!mockExam){
                return res.status(400).json({
                    error: "Tópico não encontrado."
                });
            }

            let errorFlag = 0, errorInfo = [], invalidEmails = []

            if(date){
                const mockExamDateVerify = await MockExam.findOne({date})
                if(!mockExamDateVerify){
                    mockExam.date = date
                }else{
                    errorFlag = 6
                }
            } 

            if(errorFlag > 0){
                // Pega os dados das matérias
                let {
                    subjects_names,
                    subjects_ids,
                    subjects_area
                } = await getSubjects()

                let questionSubjectAreas: any = []

                if(template_64){
                    let officialTemplate: any = [], subjects: any = []

                    let values = readOfficialTemplate(template_64, subjects_names, subjects_ids, subjects_area) 
                    officialTemplate = values.official_template
                    subjects = values.subjects
                    questionSubjectAreas = values.questionSubjectAreas
                    errorFlag = values.error_flag
                    errorInfo = values.error_info
                    
                    if(errorFlag > 0){
                        mockExam.template = officialTemplate
                        mockExam.questions_subject = subjects
                    }
                }

                if(students_template_64){
                    if(questionSubjectAreas.length === 0){
                        mockExam.questions_subject.forEach(subject_id => {
                            questionSubjectAreas.push(subjects_area[subjects_ids.indexOf(subject_id)])
                        })
                    }

                    let studentValues = await insertOrUpdateStudentsTemplate(students_template_64, mockExam, questionSubjectAreas)

                    errorFlag = studentValues.error_flag
                    errorInfo = studentValues.error_info
                    invalidEmails = studentValues.invalid_emails
                }
            }

            if(errorFlag != 0){
                const error_message = errorHub(errorFlag, errorInfo, invalidEmails)

                return res.status(400).json({
                    error: error_message
                })
            }else{
                await mockExam.save()
                return res.status(200).json(mockExam)
            }


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
    
            await MockExam.findByIdAndDelete(id)
    
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
            const mockExams = await MockExam.find({})

            return res.status(200).json(mockExams)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new MockExamController()
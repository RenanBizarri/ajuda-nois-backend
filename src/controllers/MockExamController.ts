import MockExam from "../models/MockExamModel";
import Subject from "../models/SubjectModel";
import User from "../models/UserModel";
import Common from "../Common";
import { ObjectId } from "mongodb";
import UserController from "./UserController";

async function getSubjects() {
    const all_subjects = await Subject.find({})
    let subjects_names: any = [], subjects_ids: any = [], subjects_area: any = []
    all_subjects.forEach(subject => {
        subjects_ids.push(subject._id.toString())
        subjects_names.push(subject.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
        subjects_area.push(subject.area)
    })
    return {subjects_names, subjects_ids, subjects_area}
}

function readOfficialTemplate(base64: string, subjects_names: Array<string>, subjects_ids: Array<ObjectId>, subjects_area: Array<string>){
    let official_template: any = [], subjects: any = [], questionSubjectAreas: any = [], error_flag = 0, error_info: any = {}

    let sheet_data = Common.XlsxToJson(base64)

    const possibleAnswers = ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"]

    for(let i = 0; i < sheet_data.length; i++){
        const row: any = sheet_data[i]
        if(row.Resposta && row.Resposta != "" && row.Matéria && row.Matéria != ""){
            const index: number = subjects_names.indexOf(row.Matéria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
            if(index >= 0){
                if(possibleAnswers.includes(row.Resposta)){
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

    const students = await User.find({
                activated: true,
                usertype: "student",
                email: {$in: students_email}
            })

    const possibleAnswers = ["", "a", "b", "c", "d", "e", "A", "B", "C", "D", "E"]
    const template = mockExam.template
    let achievementsGained: any[] = []

    for(let i = 0; i < sheet_data.length; i++){
        const row: any = sheet_data[i]
        
        let student: any = null
        for(let studentAux of students){
            if(studentAux.email == row.Emails){
                student = studentAux
                break
            }
        }

        // Se não achou o estudante salva para notificar o usuario
        if(student == null){
            error_flag = -1
            invalid_emails.push(row.Emails)
        }else{
            let student_template: string[] = [], humanScore = 0, natureScore = 0, mathScore = 0, languageScore = 0, questions_correct_answers = mockExam.questions_correct_answers

            let studentMockExam: any = null
            if(student.mock_exams){
                for(let studentMockExamAux of student.mock_exams){
                    if(studentMockExamAux.mock_exam_id == mockExam._id){
                        studentMockExam = studentMockExamAux
                        break
                    }
                }
            }

            for(let question in row){
                const questionNumber = Number(question)
                if(question != 'Emails' && questionNumber > 0 && questionNumber < 186) {
                    const answer = row[question]
                    if(possibleAnswers.includes(answer)){
                        student_template.push(answer)
                        if(template[questionNumber-1] === answer){
                            if(studentMockExam != null){
                                if(studentMockExam.template[questionNumber-1] !== answer) questions_correct_answers[questionNumber-1]++
                            }else{
                                questions_correct_answers[questionNumber-1]++
                            }
                            switch(subjects_area[questionNumber-1]){
                                case "human_sciences":
                                    humanScore++
                                    break
                                case "languages":
                                    languageScore++
                                    break
                                case "mathematics":
                                    mathScore++
                                    break
                                case "natural_sciences":
                                    natureScore++
                                    break
                                default: 
                                    break
                            }
                        }else if(studentMockExam != null){
                            if(studentMockExam.template[questionNumber-1] === answer) questions_correct_answers[questionNumber-1]--
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

            if(student.mock_exams){
                if(studentMockExam != null){
                    studentMockExam.template = student_template
                    studentMockExam.human_sciences_score = humanScore
                    studentMockExam.natural_sciences_score = natureScore
                    studentMockExam.languages_score = languageScore
                    studentMockExam.mathematics_score = mathScore
                    break
                }else{
                    student.mock_exams.push({
                        mock_exam_id: mockExam._id,
                        template: student_template,
                        human_sciences_score: humanScore,
                        natural_sciences_score: natureScore,
                        languages_score: languageScore,
                        mathematics_score: mathScore
                    })
                }
            }else{
                student.mock_exams = [{
                    mock_exam_id: mockExam._id,
                    template: student_template,
                    human_sciences_score: humanScore,
                    natural_sciences_score: natureScore,
                    languages_score: languageScore,
                    mathematics_score: mathScore
                }]
            }

            await student.save()

            achievementsGained = achievementsGained.concat(await mockExamAchievement(student, humanScore, natureScore, languageScore, mathScore))
        }
    }
    return {error_flag, error_info, invalid_emails, achievementsGained}
}

function errorHub(error_flag: number, error_info: any, invalid_emails: Array<string>){
    let error_message = ""
    let status = 400
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
            status = 200
            error_message = `A resposta da questão ${error_info['question']} do ${error_info['email']} não é valida, use somente as letra de A a E para o gabarito ou deixe em branco caso não tenha sido respondida`
            break
        case 4:
            status = 200
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

    return {status, error_message}
}

async function mockExamAchievement(user: any, humanScore: number, natureScore: number, languageScore: number, mathScore: number) {
    try{
        let achievements = await Common.findAchievementMissing(user, ["mock_exam_done", "mock_exam_score"])
        let achievementsGained: any[] = [], experience: number = 0

        if(achievements.length > 0){
            const totalDone = user.mock_exams.length
            const totalScore = humanScore + natureScore + languageScore + mathScore
            const adiquired = new Date().toISOString().substring(0, 10)

            achievements.forEach((achievement: any): any => {
                const newAchievement = {
                    achievement_id: achievement._id,
                    adiquired
                }
                if(achievement.type === "mock_exam_done"){
                    if(totalDone >= achievement.quantity){
                        user.achievements.push(newAchievement)
                        achievementsGained.push(achievement)
                        experience += achievement.experience
                    }
                }else{
                    switch(achievement.area){
                        case "human_sciences": 
                            if(humanScore >= achievement.quantity){
                                user.achievements.push(newAchievement)
                                achievementsGained.push(achievement)
                                experience += achievement.experience
                            } 
                            break
                        case "natural_sciences": 
                            if(natureScore >= achievement.quantity){
                                user.achievements.push(newAchievement)
                                achievementsGained.push(achievement)
                                experience += achievement.experience
                            }
                            break
                        case "languages": 
                            if(languageScore >= achievement.quantity){
                                user.achievements.push(newAchievement)
                                achievementsGained.push(achievement)
                                experience += achievement.experience
                            }
                            break
                        case "mathematics": 
                            if(mathScore >= achievement.quantity){
                                user.achievements.push(newAchievement)
                                achievementsGained.push(achievement)
                                experience += achievement.experience
                            }
                            break
                        default:
                            if(totalScore >= achievement.quantity){
                                user.achievements.push(newAchievement)
                                achievementsGained.push(achievement)
                                experience += achievement.experience
                            }
                            break
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

class MockExamController {
    async create(req: any, res: any){
        try{
            let {
                date,
                template_64,
                students_template_64
            } = req.body

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

            let official_template: any[] = [], subjects: any[] = [], questionSubjectAreas: any[] = [], error_flag = 0, error_info: any = {}, invalid_emails: any[] = [], achievements: any[] = []

            let mockExam = await MockExam.findOne({date})

            if(mockExam) error_flag = 6

            if(error_flag === 0){
                let values = readOfficialTemplate(template_64, subjects_names, subjects_ids, subjects_area) 
                official_template = values.official_template
                subjects = values.subjects
                questionSubjectAreas = values.questionSubjectAreas
                error_flag = values.error_flag
                error_info = values.error_info

                if(error_flag === 0){
                    const questions_correct_answers = new Array(185).fill(0)
                    mockExam = await new MockExam({
                        date, 
                        template: official_template,
                        questions_subject: subjects,
                        questions_correct_answers
                    }).save()

                    let studentValues = await insertOrUpdateStudentsTemplate(students_template_64, mockExam, questionSubjectAreas)

                    error_flag = studentValues.error_flag
                    error_info = studentValues.error_info
                    invalid_emails = studentValues.invalid_emails
                    achievements = studentValues.achievementsGained
                }
            }

            if(error_flag != 0){
                const error_data = errorHub(error_flag, error_info, invalid_emails)

                return res.status(error_data.status).json({
                    error: error_data.error_message
                })
            }else{

                return res.status(200).json({mockExam, achievements})
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

            let errorFlag: number = 0, errorInfo: any[] = [], invalidEmails: any[] = [], achievements: any[] = []

            if(date){
                console.log(date)
                const mockExamDateVerify = await MockExam.findOne({date})
                if(!mockExamDateVerify){
                    mockExam.date = date
                }else{
                    errorFlag = 6
                }
            } 

            if(errorFlag == 0){
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
                            questionSubjectAreas.push(subjects_area[subjects_ids.indexOf(subject_id.toString())])
                        })
                    }

                    let studentValues = await insertOrUpdateStudentsTemplate(students_template_64, mockExam, questionSubjectAreas)

                    errorFlag = studentValues.error_flag
                    errorInfo = studentValues.error_info
                    invalidEmails = studentValues.invalid_emails
                    achievements = studentValues.achievementsGained
                }
            }

            if(errorFlag != 0){
                const error_data = errorHub(errorFlag, errorInfo, invalidEmails)

                return res.status(error_data.status).json({
                    error: error_data.error_message
                })
            }else{
                await mockExam.save()
                return res.status(200).json({mockExam, achievements})
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
                    error: "Sem id do Simulado para excluir"
                });
            }
    
            await MockExam.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "Simulado excluido"
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
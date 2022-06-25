import express from "express"

//Middleware
import auth from "./middleware/auth";

//Controllers
import UserController from "./controllers/UserController";
import AchievementController from "./controllers/AchievementController";
import TipController from "./controllers/TipController";
import QuestionController from "./controllers/QuestionController";
import QuizController from "./controllers/QuizController";
import EnemController from "./controllers/EnemController";
import LessonController from "./controllers/LessonController";
import SubjectController from "./controllers/SubjectController";
import TopicController from "./controllers/TopicController";
import MockExamController from "./controllers/MockExamController";
import StudyPlanController from "./controllers/StudyPlanController";

//Common
import Common from "./Common";

const routes = express.Router();

// Rotas do usuario
routes.post("/createUser", auth, UserController.createUser)
routes.post("/createAdmin", UserController.createAdmin)
routes.post("/login", UserController.login)
routes.get("/getUsers", auth, UserController.getAllUsers)
routes.delete("/deleteUser", auth, UserController.delete)
routes.post("/recoverPassword", UserController.requestRecoverPassword)
routes.post("/changePassword", UserController.changePassword)
routes.get("/changePassword/:reset_token", UserController.verifyResetToken)
routes.post("/addPomodoro", auth, UserController.addPomodoro)
routes.post("/dashboard", auth, UserController.dashboard)
routes.post("/updateUser", auth, UserController.updateUser)
routes.post("/updateXp", UserController.updateUserTest)

// Rotas de conquistas
routes.post("/createAchievement", auth, AchievementController.create)
routes.get("/getAchievements", auth, AchievementController.findAll)
routes.put("/updateAchievement", auth, AchievementController.update)
routes.delete("/deleteAchievement", auth, AchievementController.delete)

// Rotas de dicas
routes.post("/createTip", auth, TipController.create)
routes.get("/getTips", auth, TipController.findAll)
routes.get("/getMyTips", auth, TipController.findByUser)
routes.put("/updateTip", auth, TipController.update)
routes.delete("/deleteTip", auth, TipController.delete)

// Rotas de questões
routes.post("/createQuestion", auth, QuestionController.create)
routes.get("/getQuestions", auth, QuestionController.findAll)
routes.post("/getQuestionsByTopic", auth, QuestionController.findByTopic)
routes.put("/updateQuestion", auth, QuestionController.update)
routes.delete("/deleteQuestion", auth, QuestionController.delete)

// Rotas de quizes
routes.post("/createQuiz", auth, QuizController.create)
routes.get("/getQuizes", auth, QuizController.findAll)
routes.put("/updateQuiz", auth, QuizController.update)
routes.delete("/deleteQuiz", auth, QuizController.delete)
routes.post("/finishQuiz", QuizController.finishQuiz)

// Rotas de Enems
routes.post("/createEnem", auth, EnemController.create)
routes.get("/getEnems", auth, EnemController.findAll)
routes.put("/updateEnem", auth, EnemController.update)
routes.delete("/deleteEnem", auth, EnemController.delete)
routes.get("/getEnemsOrganized", auth, EnemController.findByYearDayCollor)

// Rotas de Aulas
routes.post("/createLesson", auth, LessonController.create)
routes.get("/getLessons", auth, LessonController.findAll)
routes.post("/getLessonsByTopic", auth, LessonController.findByTopic)
routes.put("/updateLesson", auth, LessonController.update)
routes.delete("/deleteLesson", auth, LessonController.delete)
routes.post("/lessonViewned", LessonController.lessonViewned)

// Rotas de Matérias
routes.post("/createSubject", auth, SubjectController.create)
routes.get("/getSubjects", auth, SubjectController.findAll)
routes.put("/updateSubject", auth, SubjectController.update)
routes.delete("/deleteSubject", auth, SubjectController.delete)

// Rotas de Tópicos
routes.post("/createTopic", auth, TopicController.create)
routes.get("/getTopics", auth, TopicController.findAll)
routes.get("/getContent", auth, TopicController.getLessonsAndQuizzes)
routes.put("/updateTopic", auth, TopicController.update)
routes.delete("/deleteTopic", auth, TopicController.delete)

// Rotas de Simulados
routes.post("/createMockExam", auth, MockExamController.create)
routes.get("/getMockExams", auth, MockExamController.findAll)
routes.put("/updateMockExam", auth, MockExamController.update)
routes.delete("/deleteMockExam", auth, MockExamController.delete)

// Rotas do Plano de Estudo
routes.post("/createStudyPlan", auth, StudyPlanController.create)
routes.get("/getStudyPlans", auth, StudyPlanController.findAll)
routes.put("/updateStudyPlan", auth, StudyPlanController.update)
routes.delete("/deleteStudyPlan", auth, StudyPlanController.delete)

// Rotas de apoio
routes.post("/uploadImage", auth, Common.uploadImage)

export default routes;
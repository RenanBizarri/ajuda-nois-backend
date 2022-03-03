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

//Common
import Common from "./Common";

const routes = express.Router();

// Rotas do usuario
routes.post("/createUser", auth, UserController.createUser)
routes.post("/createAdmin", UserController.createAdmin)
routes.post("/login", UserController.login)
routes.delete("/deleteUser", auth, UserController.delete)

// Rotas de conquistas
routes.post("/createAchievement", auth, AchievementController.create)
routes.get("/getAchievements", auth, AchievementController.findAll)
routes.put("/updateAchievement", auth, AchievementController.update)
routes.delete("/deleteAchievement", auth, AchievementController.delete)

// Rotas de dicas
routes.post("/createTip", auth, TipController.create)
routes.get("/getTips", auth, TipController.findAll)
routes.put("/updateTip", auth, TipController.update)
routes.delete("/deleteTip", auth, TipController.delete)

// Rotas de questões
routes.post("/createQuestion", auth, QuestionController.create)
routes.get("/getQuestions", auth, QuestionController.findAll)
routes.put("/updateQuestion", auth, QuestionController.update)
routes.delete("/deleteQuestion", auth, QuestionController.delete)

// Rotas de quizes
routes.post("/createQuiz", auth, QuizController.create)
routes.get("/getQuizes", auth, QuizController.findAll)
routes.put("/updateQuiz", auth, QuizController.update)
routes.delete("/deleteQuiz", auth, QuizController.delete)

// Rotas de Enems
routes.post("/createEnem", auth, EnemController.create)
routes.get("/getEnems", auth, EnemController.findAll)
routes.put("/updateEnem", auth, EnemController.update)
routes.delete("/deleteEnem", auth, EnemController.delete)

// Rotas de Aulas
routes.post("/createLesson", auth, LessonController.create)
routes.get("/getLessons", auth, LessonController.findAll)
routes.put("/updateLesson", auth, LessonController.update)
routes.delete("/deleteLesson", auth, LessonController.delete)

// Rotas de Matérias
routes.post("/createSubject", auth, SubjectController.create)
routes.get("/getSubjects", auth, SubjectController.findAll)
routes.put("/updateSubject", auth, SubjectController.update)
routes.delete("/deleteSubject", auth, SubjectController.delete)

// Rotas de Tópicos
routes.post("/createTopic", auth, TopicController.create)
routes.get("/getTopics", auth, TopicController.findAll)
routes.put("/updateTopic", auth, TopicController.update)
routes.delete("/deleteTopic", auth, TopicController.delete)

// Rotas de apoio
routes.post("/uploadImage", auth, Common.uploadImage)

export default routes;
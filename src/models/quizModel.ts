import mongoose from "mongoose"

import Subject from "./subjectModel"
import Question from "./questionModel"

export interface IQuiz {
    name: string,
    subject: mongoose.Schema.Types.ObjectId,
    questions: [mongoose.Schema.Types.ObjectId]
}

export const QuizSchema: mongoose.Schema = new mongoose.Schema<IQuiz>({
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Subject,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Question,
        required: true
    }]
})

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
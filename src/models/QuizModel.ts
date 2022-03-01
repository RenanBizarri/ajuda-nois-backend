import mongoose from "mongoose"

import Subject from "./SubjectModel"
import Question from "./QuestionModel"

export interface IQuiz {
    name: string,
    subject_id: mongoose.Schema.Types.ObjectId,
    questions_ids: [mongoose.Schema.Types.ObjectId]
}

export const QuizSchema: mongoose.Schema = new mongoose.Schema<IQuiz>({
    name: {
        type: String,
        required: true,
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Subject,
        required: true
    },
    questions_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Question,
        required: true
    }]
})

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
import mongoose from "mongoose"

import Subject from "./SubjectModel"
import Quiz from "./QuizModel"

export interface ILesson {
    title: string,
    description: string,
    subject: mongoose.Schema.Types.ObjectId,
    links?: [string],
    questions: [mongoose.Schema.Types.ObjectId]
}

export const LessonSchema: mongoose.Schema = new mongoose.Schema<ILesson>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Subject,
        required: true
    },
    links: [{
        type: String,
    }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Quiz
    }]
})

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
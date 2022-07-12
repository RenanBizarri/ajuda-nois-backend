import mongoose from "mongoose"

export interface IMockExam {
    date: string,
    template: [string],
    questions_subject: [mongoose.Schema.Types.ObjectId],
    questions_correct_answers: [number]
}

export const MockExamSchema: mongoose.Schema = new mongoose.Schema<IMockExam>({
    date: {
        type: String,
        required: true,
        unique: true
    },
    template: [{
        type: String,
        required: true
    }],
    questions_subject: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }],
    questions_correct_answers: [{
        type: Number,
        required: true
    }],
})

const Mock_Exam = mongoose.model<IMockExam>("Mock_Exam", MockExamSchema);
export default Mock_Exam;
import mongoose from "mongoose"

export interface IMockExam {
    date: Date,
    template: string
}

export const MockExamSchema: mongoose.Schema = new mongoose.Schema<IMockExam>({
    date: {
        type: Date,
        required: true
    },
    template: {
        type: String,
        required: true
    }
})

const Mock_Exam = mongoose.model<IMockExam>("Mock_Exam", MockExamSchema);
export default Mock_Exam;
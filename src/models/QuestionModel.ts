import mongoose from "mongoose"

export interface IQuestion {
    question: string,
    alternatives: [string],
    answer: string
}

export const QuestionSchema: mongoose.Schema = new mongoose.Schema<IQuestion>({
    question: {
        type: String,
        required: true
    },
    alternatives: [{
        type: String,
        required: true
    }],
    answer: {
        type: String,
        required: true
    }
})

const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
export default Question;
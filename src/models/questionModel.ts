import mongoose from "mongoose"

export interface IQuestion {
    text: string,
    alternatives: [string],
    answer: string
}

export const QuestionSchema: mongoose.Schema = new mongoose.Schema<IQuestion>({
    text: {
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
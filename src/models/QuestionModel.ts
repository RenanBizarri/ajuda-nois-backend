import mongoose from "mongoose"

export interface IQuestion {
    name: string,
    question: string,
    alternatives: [string],
    answer: string,
    topic_id: mongoose.Types.ObjectId
}

export const QuestionSchema: mongoose.Schema = new mongoose.Schema<IQuestion>({
    name: {
        type: String,
        required: true,
        unique: true
    },
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
    },
    topic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
})

const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
export default Question;
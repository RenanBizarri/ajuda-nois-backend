import mongoose from "mongoose"

export interface IQuiz {
    name: string,
    topic_id: mongoose.Schema.Types.ObjectId,
    questions_ids: [mongoose.Schema.Types.ObjectId]
}

export const QuizSchema: mongoose.Schema = new mongoose.Schema<IQuiz>({
    name: {
        type: String,
        required: true,
    },
    topic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    questions_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }]
})

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
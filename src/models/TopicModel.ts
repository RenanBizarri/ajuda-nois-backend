import mongoose from "mongoose"

export interface ITopic {
    name: string,
    subject: string,
    startTime?: string,
    finishTime?: string,
    isDone?: boolean
}

export const TopicSchema: mongoose.Schema = new mongoose.Schema<ITopic>({
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
    },
    finishTime: {
        type: String,
    },
    isDone: {
        type: Boolean,
    },
})

const Topic = mongoose.model<ITopic>("Topic", TopicSchema);
export default Topic;
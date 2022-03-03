import mongoose from "mongoose"

export interface ITopic {
    name: string,
    subject_id: mongoose.Schema.Types.ObjectId,
}

export const TopicSchema: mongoose.Schema = new mongoose.Schema<ITopic>({
    name: {
        type: String,
        required: true,
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
})

const Topic = mongoose.model<ITopic>("Topic", TopicSchema);
export default Topic;
import mongoose from "mongoose"

export interface ITip {
    topic: string,
    information: string,
    user_id: mongoose.Types.ObjectId 
    color?: string
}

export const TipSchema: mongoose.Schema = new mongoose.Schema<ITip>({
    topic: {
        type: String,
        required: true
    },
    information: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String
    }
})

const Tip = mongoose.model<ITip>("Tip", TipSchema);
export default Tip;
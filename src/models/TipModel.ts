import mongoose from "mongoose"

export interface ITip {
    name: string,
    information: string,
    user_id: mongoose.Types.ObjectId 
}

export const TipSchema: mongoose.Schema = new mongoose.Schema<ITip>({
    name: {
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
    }
})

const Tip = mongoose.model<ITip>("Tip", TipSchema);
export default Tip;
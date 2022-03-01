import mongoose from "mongoose"

export interface IEnem {
    year: number,
    exam: string, 
    template: string
}

export const EnemSchema: mongoose.Schema = new mongoose.Schema<IEnem>({
    year: {
        type: Number,
        required: true
    },
    exam: {
        type: String,
        required: true
    },
    template: {
        type: String,
        required: true
    }
})

const Enem = mongoose.model<IEnem>("Enem", EnemSchema);
export default Enem;
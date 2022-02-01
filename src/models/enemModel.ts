import mongoose from "mongoose"

export interface IEnem {
    year: number,
    exam: string, 
    template: string
}

export const EnemSchema: mongoose.Schema = new mongoose.Schema<IEnem>({
    year: {
        type: Number,
        require: true
    },
    exam: {
        type: String,
        require: true
    },
    template: {
        type: String,
        require: true
    }
})

const Enem = mongoose.model<IEnem>("Enem", EnemSchema);
export default Enem;
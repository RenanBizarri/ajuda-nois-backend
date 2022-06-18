import mongoose from "mongoose"

export interface ISubject {
    name: string,
    area: string,
    user_id?: mongoose.Types.ObjectId
}

export const SubjectSchema: mongoose.Schema = new mongoose.Schema<ISubject>({
    name:{
        type: String,
        unique: true,
        required: true
    },
    area: {
        type: String,
        required: true,
        enum: ["human_sciences", "languages", "mathematics", "natural_sciences"]
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Subject = mongoose.model<ISubject>("Subject", SubjectSchema);
export default Subject;
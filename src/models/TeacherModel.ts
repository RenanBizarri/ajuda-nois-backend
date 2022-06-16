import mongoose from "mongoose"

export interface ITeacher {
    user_id: mongoose.Types.ObjectId,
    subjects_id?: [mongoose.Types.ObjectId]
}

export const TeacherSchema: mongoose.Schema = new mongoose.Schema<ITeacher>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subjects_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }]
})

const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);
export default Teacher;
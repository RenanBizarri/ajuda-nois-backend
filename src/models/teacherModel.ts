import mongoose, { mongo } from "mongoose"

import User from "./userModel";
import Tip from "./tipModel";
import Subject from "./subjectModel";

export interface ITeacher {
    user_id: mongoose.Schema.Types.ObjectId,
    tips_id?: [mongoose.Schema.Types.ObjectId],
    subjects_id?: [mongoose.Schema.Types.ObjectId]
}

export const TeacherSchema: mongoose.Schema = new mongoose.Schema<ITeacher>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    tips_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Tip
    }],
    subjects_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Subject
    }]
})

const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);
export default Teacher;
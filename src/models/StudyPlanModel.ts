import mongoose from "mongoose"

export interface IStudyPlan {
    user_id: mongoose.Types.ObjectId,
    studies: [{
        subject_id: mongoose.Types.ObjectId,
        topic_id: mongoose.Types.ObjectId,
        begin: string,
        end: string,
        description?: string
    }],
    date: string
}

export const StudyPlanSchema: mongoose.Schema = new mongoose.Schema<IStudyPlan>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studies: [{
        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        topic_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
            required: true
        },
        begin: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    }],
    date: {
        type: String,
        required: true
    }
})

const StudyPlan = mongoose.model<IStudyPlan>("StudyPlan", StudyPlanSchema);
export default StudyPlan;
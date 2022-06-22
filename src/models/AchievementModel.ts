import mongoose from "mongoose"

export interface IAchievement {
    icon: String,
    name: String, 
    description: String,
    experience: number,
    type: String,
    quantity: number,
    area: String
}

export const AchievementSchema: mongoose.Schema = new mongoose.Schema<IAchievement>({
    icon: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["pomodoro_time", "level", "quiz_completed", "topics_completed", "mock_exam_made", "mock_exam_score"]
    },
    quantity: {
        type: Number,
        required: true
    },
    area: {
        type: String,
        required: true,
        enum: ["general", "human_sciences", "languages", "mathematics", "natural_sciences"]
    },
})

const Achievement = mongoose.model<IAchievement>("Achievement", AchievementSchema);
export default Achievement;
import mongoose from "mongoose"

export interface IAchievement {
    icon: String,
    name: String, 
    description: String,
    experience: number,
}

export const AchievementSchema: mongoose.Schema = new mongoose.Schema<IAchievement>({
    icon: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    }
})

const Achievement = mongoose.model<IAchievement>("Achievement", AchievementSchema);
export default Achievement;
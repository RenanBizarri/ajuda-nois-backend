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
        require: true
    },
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    experience: {
        type: Number,
        require: true
    }
})

const Achievement = mongoose.model<IAchievement>("Achievement", AchievementSchema);
export default Achievement;
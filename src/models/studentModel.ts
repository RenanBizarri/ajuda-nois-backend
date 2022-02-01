import mongoose from "mongoose"

import User from "./userModel";
import Achievement from "./achievementModel"

export interface IStudent {
    user_id: mongoose.Schema.Types.ObjectId,
    achievements?: [{
        achievement_id: mongoose.Schema.Types.ObjectId,
        adiquired: Date
    }],
    mockExams?: [{
        date: Date,
        linguisticScore: number,
        mathematicScore: number,
        naturalScienceScore: number,
        humanScienceScore: number,
        essayScore: number,
        geralScore: number
    }],
    quizScore?: [{
        quiz_id: mongoose.Schema.Types.ObjectId,
        score: number
    }]
}

export const StudentSchema: mongoose.Schema = new mongoose.Schema<IStudent>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    achievements: [{
        achievement_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Achievement,
            required: true
        },
        adiquired: {
            type: Date,
            required: true
        }
    }],
    mockExams: [{
        date:{
            type: Date,
            required: true
        },
        languageScore: {
            type: Number
        },
        mathematicScore: {
            type: Number
        },
        naturalScienceScore: {
            type: Number
        },
        humanScienceScore: {
            type: Number
        },
        essayScore: {
            type: Number
        }
    }],
    quizScore: [{
        quiz_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Achievement,
            required: true
        },
        score: {
            type: Number,
            required: true
        }
    }]
})

const Student = mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
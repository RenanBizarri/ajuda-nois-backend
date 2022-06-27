import mongoose from "mongoose"
import bcrypt from "bcrypt"

mongoose.Schema.Types.String.checkRequired(v => v != null)
export interface IUser {
    created: string,
    username: string,
    email: string,
    password: string,
    usertype: string,
    activated: boolean,
    password_reset_token?: string,
    password_reset_expire?: number,
    achievements?: [{
        achievement_id: mongoose.Types.ObjectId,
        date: string
    }],
    mock_exams?: [{
        mock_exam_id: mongoose.Types.ObjectId,
        template: string[],
        languages_score: number,
        mathematics_score: number,
        natural_sciences_score: number,
        human_sciences_score: number,
    }],
    quiz_score?: [{
        quiz_id: mongoose.Types.ObjectId,
        score: number,
        date: string,
        awnsers: [string]
    }],
    lessons_viewed?: [{
        lesson_id: mongoose.Types.ObjectId,
        date: string
    }],
    topics_completed?: [mongoose.Types.ObjectId];
    pomodoros?: [{
        pomodoro: {
            humans_time: number,
            languages_time: number,
            maths_time: number,
            natural_time: number,
        },
        year: number,
        month: number
    }],
    experience?: number,
    level?: number
}

export const UserSchema: mongoose.Schema = new mongoose.Schema<IUser>({
    created: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    usertype: {
        type: String,
        required: true,
        enum: ["admin", "student", "teacher"]
    },
    activated: {
        type: Boolean,
        required: true
    },
    password_reset_token: {
        type: String
    },
    password_reset_expire: {
        type: Number
    },
    achievements: [{
        achievement_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement',
            required: true
        },
        adiquired: {
            type: String,
            required: true
        }
    }],
    mock_exams: [{
        mock_exam_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mock_Exam',
            required: true
        },
        template: [{
            type: String,
            required: true
        }],
        languages_score: {
            type: Number
        },
        mathematics_score: {
            type: Number
        },
        natural_sciences_score: {
            type: Number
        },
        human_sciences_score: {
            type: Number
        }
    }],
    quiz_score: [{
        quiz_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        awnsers: [{
            type: String,
            required: true
        }]
    }],
    lessons_viewed: [{
        lesson_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true
        },
        date: {
            type: String,
            required: true
        }
    }],
    topics_completed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true
    }],
    pomodoros: [{
        pomodoro: {
            humans_time: {
                type: Number
            },
            languages_time: {
                type: Number
            },
            maths_time: {
                type: Number
            },
            natural_time: {
                type: Number
            }
        },
        year: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        }
    }],
    experience: {
        type: Number
    },
    level: {
        type: Number
    }
})

UserSchema.pre('save', async function(next){
    if(!this.isModified("password")) next()
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
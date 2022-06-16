import mongoose from "mongoose"

export interface IStudent {
    user_id: mongoose.Types.ObjectId,
    achievements?: [{
        achievement_id: mongoose.Types.ObjectId,
        date: string
    }],
    mock_exams?: [{
        mock_exam_id: mongoose.Types.ObjectId,
        template: [string],
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
    pomodoros?: [{
        pomodoro: {
            humans_time: number,
            languages_time: number,
            maths_time: number,
            natures_time: number,
        },
        year: number,
        month: number
    }],
    experience: number,
    level: number
}

export const StudentSchema: mongoose.Schema = new mongoose.Schema<IStudent>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    }
})

const Student = mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
import mongoose from "mongoose"

export interface IStudent {
    user_id: mongoose.Schema.Types.ObjectId,
    achievements?: [{
        achievement_id: mongoose.Schema.Types.ObjectId,
        date: Date
    }],
    mock_exams?: [{
        mock_exam_id: mongoose.Schema.Types.ObjectId,
        template: string,
        linguisticScore: number,
        mathematicScore: number,
        naturalScienceScore: number,
        humanScienceScore: number,
        essayScore: number,
        geralScore: number
    }],
    quiz_score?: [{
        quiz_id: mongoose.Schema.Types.ObjectId,
        score: number,
        date: Date
    }],
    lessons_viewed?: [{
        lesson_id: mongoose.Schema.Types.ObjectId,
        date: Date
    }],
    pomodoros?: {
        pomodoro_per_mounth: {
            humans_time: number,
            languages_time: number,
            maths_time: number,
            natures_time: number,
            month: number
        },
        year: number
    }
}

export const StudentSchema: mongoose.Schema = new mongoose.Schema<IStudent>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievements: [{
        achievement_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement',
            required: true
        },
        adiquired: {
            type: Date,
            required: true
        }
    }],
    mock_exams: [{
        mock_exam_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mock_Exam',
            required: true
        },
        template: {
            type: String
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
            type: Date,
            required: true
        }
    }],
    lessons_viewed: [{
        lesson_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }],
    pomodoros: {
        pomodoro_per_mounth: {
            humans_time: {
                type: Number
            },
            languages_time: {
                type: Number
            },
            maths_time: {
                type: Number
            },
            natures_time: {
                type: Number
            },
            month: {
                type: Number,
                required: true
            }
        },
        year: {
            type: Number,
            required: true
        }
    }
})

const Student = mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
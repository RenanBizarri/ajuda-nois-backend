import mongoose from "mongoose"

export interface IStudent {
    user_id: mongoose.Schema.Types.ObjectId,
    achievements?: [{
        achievement_id: mongoose.Schema.Types.ObjectId,
        date: string
    }],
    mock_exams?: [{
        mock_exam_id: mongoose.Schema.Types.ObjectId,
        template: [string],
        linguisticScore: number,
        mathematicScore: number,
        naturalScienceScore: number,
        humanScienceScore: number,
    }],
    quiz_score?: [{
        quiz_id: mongoose.Schema.Types.ObjectId,
        score: number,
        date: string,
        awnsers: [string]
    }],
    lessons_viewed?: [{
        lesson_id: mongoose.Schema.Types.ObjectId,
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
        required: true
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
            natures_time: {
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
import mongoose from "mongoose"

export interface ILesson {
    title: string,
    content: string,
    subject_id: mongoose.Types.ObjectId,
    topic_id: mongoose.Types.ObjectId
}

export const LessonSchema: mongoose.Schema = new mongoose.Schema<ILesson>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    topic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    }
})

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
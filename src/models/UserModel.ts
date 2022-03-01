import mongoose from "mongoose"
import bcrypt from "bcrypt"

export interface IUser {
    created: Date,
    username: string,
    email: string,
    password: string,
    usertype: string
}

export const UserSchema: mongoose.Schema = new mongoose.Schema<IUser>({
    created: {
        type: Date,
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
    }
})

UserSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
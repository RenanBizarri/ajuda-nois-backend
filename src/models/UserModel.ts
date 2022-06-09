import mongoose from "mongoose"
import bcrypt from "bcrypt"

export interface IUser {
    created: string,
    username: string,
    email: string,
    password: string,
    usertype: string,
    activated: boolean,
    password_reset_token?: string,
    password_reset_expire?: number
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
})

UserSchema.pre('save', async function(next){
    if(!this.isModified("password")) next()
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
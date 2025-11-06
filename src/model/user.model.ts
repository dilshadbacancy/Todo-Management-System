
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    age?: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
}

// const userSchema = new Schema<IUser>({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     age: { type: Number, required: false },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },

// });



const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't return password by default
        },
        age: {
            type: Number,
            required: false,
            min: [1, 'Age must be at least 1'],
            max: [120, 'Age cannot exceed 120']
        },
    },
    {
        timestamps: true,
    }
);



userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function (): string {
    const token = jwt.sign(
        {
            id: this._id,
            email: this.email
        },
        config.keys.secret_keys.jwt_key!,
        {
            expiresIn: '1d'
        }
    )
    return token;
}


export const User = mongoose.model<IUser>("User", userSchema);
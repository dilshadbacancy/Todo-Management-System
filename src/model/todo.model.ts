import mongoose, { Document, mongo, Schema } from "mongoose";

export interface TodoModel extends Document {
    title: string;
    description?: string;
    completed: boolean;
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: Date;
    assignedTo: mongoose.Schema.Types.ObjectId;
    assignedBy: mongoose.Schema.Types.ObjectId,
    assignedAt: Date
    user: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const todoSchema = new Schema<TodoModel>({
    title: {
        type: String,
        require: [true, 'Title is required'],
        trim: true,
        maxlength: [100, "Titile can not exceed 100 charachter"]
    },
    description: {
        type: String,
        require: [true, 'Description is required'],
        trim: true,
        maxlength: [500, "Description can not exceed 100 charachter"]
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    dueDate: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [false, "Assigned is required"]
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    }
}, {
    timestamps: true
})

todoSchema.index({ user: 1, createdAt: -1 })

export const Todo = mongoose.model<TodoModel>('Todo', todoSchema);
import { Document, Model, model, Schema, ObjectId } from 'mongoose';

interface IUser extends Document<ObjectId> {
    accountNumber: string;
    name: string;
    balance: number;
}

const userSchema = new Schema<IUser>({
    accountNumber: { type: String, required: true },
    name: { type:String, required: true },
    balance: { type: Number, required: true }
})

export const User = model<IUser>('User', userSchema)

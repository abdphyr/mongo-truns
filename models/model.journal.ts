import { model, Schema, Document, ObjectId } from 'mongoose';

interface IJournal extends Document<ObjectId> {
    accountNumber: string;
    operation: string;
    amount: number;
}

const journalSchema = new Schema<IJournal>({
    accountNumber: { type: String, required: true },
    operation: { type: String, required: true },
    amount: { type: Number, required: true }
})

export const Journal = model<IJournal>('Journal', journalSchema)
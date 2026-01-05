import { Schema, model, Document, Types } from 'mongoose';

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

export interface ISession extends Document {
    _id: Types.ObjectId;
    trainer: Types.ObjectId;
    client: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    notes?: string;
    status: SessionStatus;
    evidenceImage?: string;
    failureReason?: string;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
    {
        trainer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        notes: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'missed'],
            default: 'scheduled'
        },
        evidenceImage: {
            type: String
        },
        failureReason: {
            type: String,
            trim: true
        },
        feedback: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

// Indexes for efficient querying by date and user
sessionSchema.index({ trainer: 1, startTime: 1 });
sessionSchema.index({ client: 1, startTime: 1 });

export const SessionModel = model<ISession>('Session', sessionSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
    userId: Types.ObjectId;
    type: 'message' | 'session_scheduled' | 'system';
    title: string;
    message: string;
    read: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['message', 'session_scheduled', 'system'], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);

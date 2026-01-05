import { Schema, model, Document, Types } from 'mongoose';

export type TrainerChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ITrainerChangeRequest extends Document {
  clientId: Types.ObjectId;
  currentTrainerId?: Types.ObjectId | null;
  requestedTrainerId?: Types.ObjectId | null;
  reason: string;
  status: TrainerChangeRequestStatus;
  processedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const trainerChangeRequestSchema = new Schema<ITrainerChangeRequest>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentTrainerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    requestedTrainerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

export const TrainerChangeRequestModel = model<ITrainerChangeRequest>('TrainerChangeRequest', trainerChangeRequestSchema);

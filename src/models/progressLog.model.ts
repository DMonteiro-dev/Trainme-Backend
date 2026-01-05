import { Schema, model, Document, Types } from 'mongoose';

interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  [key: string]: number | undefined;
}

export interface IProgressLog extends Document {
  clientId: Types.ObjectId;
  trainerId?: Types.ObjectId;
  date: Date;
  weight?: number;
  bodyFatPercent?: number;
  measurements?: Measurements;
  notes?: string;
  workoutPlanId?: Types.ObjectId;
}

const progressLogSchema = new Schema<IProgressLog>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    weight: Number,
    bodyFatPercent: Number,
    measurements: { type: Map, of: Number },
    notes: String,
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' }
  },
  { timestamps: true }
);

export const ProgressLogModel = model<IProgressLog>('ProgressLog', progressLogSchema);

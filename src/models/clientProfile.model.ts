import { Schema, model, Document, Types } from 'mongoose';

export interface IClientProfile extends Document {
  userId: Types.ObjectId;
  age?: number;
  height?: number;
  weight?: number;
  goals?: string;
  medicalRestrictions?: string;
  preferences?: string;
}

const clientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    goals: { type: String },
    medicalRestrictions: { type: String },
    preferences: { type: String }
  },
  { timestamps: true }
);

export const ClientProfileModel = model<IClientProfile>('ClientProfile', clientProfileSchema);

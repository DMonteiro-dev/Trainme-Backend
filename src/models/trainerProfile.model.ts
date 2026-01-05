import { Schema, model, Document, Types } from 'mongoose';

export interface ITrainerProfile extends Document {
  userId: Types.ObjectId;
  bio?: string;
  specialties: string[];
  yearsOfExperience?: number;
  pricePerSession?: number;
  location?: string;
  onlineSessionsAvailable: boolean;
  ratingAverage: number;
  ratingCount: number;
  socialLinks?: string[];
}

const trainerProfileSchema = new Schema<ITrainerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, trim: true },
    specialties: { type: [String], default: [] },
    yearsOfExperience: { type: Number, min: 0 },
    pricePerSession: { type: Number, min: 0 },
    location: { type: String },
    onlineSessionsAvailable: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    socialLinks: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const TrainerProfileModel = model<ITrainerProfile>('TrainerProfile', trainerProfileSchema);

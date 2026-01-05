import { Schema, model, type Document, type Types } from 'mongoose';

export interface IExerciseDefinition extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio' | 'full_body' | 'other';
    equipment: 'none' | 'dumbbell' | 'barbell' | 'machine' | 'cables' | 'kettlebell' | 'band' | 'other';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    videoUrl?: string;
    createdBy?: Types.ObjectId; // If null, it's a system exercise
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const exerciseDefinitionSchema = new Schema<IExerciseDefinition>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String },
        muscleGroup: {
            type: String,
            enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body', 'other'],
            required: true,
            default: 'other'
        },
        equipment: {
            type: String,
            enum: ['none', 'dumbbell', 'barbell', 'machine', 'cables', 'kettlebell', 'band', 'other'],
            required: true,
            default: 'none'
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
            default: 'beginner'
        },
        videoUrl: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        isSystem: { type: Boolean, default: false }
    },
    { timestamps: true }
);

exerciseDefinitionSchema.index({ name: 'text', description: 'text' });
exerciseDefinitionSchema.index({ muscleGroup: 1 });
exerciseDefinitionSchema.index({ equipment: 1 });

export const ExerciseDefinitionModel = model<IExerciseDefinition>('ExerciseDefinition', exerciseDefinitionSchema);

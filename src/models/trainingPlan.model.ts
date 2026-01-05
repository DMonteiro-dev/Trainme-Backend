import { Schema, model, type Document, type Types } from 'mongoose';

export interface IExercise {
    name: string;
    sets: number;
    reps: string;
    instructions?: string;
    videoLink?: string;
}

export interface IDailyPlan {
    dayOfWeek: number; // 1 (Monday) - 7 (Sunday) or just 1-5 for sequence
    label?: string; // e.g., "Day 1", "Leg Day"
    exercises: IExercise[];
}

export interface ITrainingPlan extends Document {
    trainerId: Types.ObjectId;
    clientId: Types.ObjectId;
    name: string;
    frequency: 3 | 4 | 5;
    startDate: Date;
    durationWeeks: number;
    schedule: IDailyPlan[];
    status: 'active' | 'archived';
}

const exerciseSchema = new Schema<IExercise>({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    instructions: { type: String },
    videoLink: { type: String }
}, { _id: false });

const dailyPlanSchema = new Schema<IDailyPlan>({
    dayOfWeek: { type: Number, required: true },
    label: { type: String },
    exercises: {
        type: [exerciseSchema],
        validate: [
            (val: IExercise[]) => val.length <= 10,
            '{PATH} exceeds the limit of 10'
        ]
    }
}, { _id: false });

const trainingPlanSchema = new Schema<ITrainingPlan>(
    {
        trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        frequency: { type: Number, enum: [3, 4, 5], required: true },
        startDate: { type: Date, required: true, default: Date.now },
        durationWeeks: { type: Number, default: 4 }, // Default to 4 weeks, can be more
        schedule: [dailyPlanSchema],
        status: { type: String, enum: ['active', 'archived'], default: 'active' }
    },
    { timestamps: true }
);

trainingPlanSchema.index({ trainerId: 1 });
trainingPlanSchema.index({ clientId: 1, status: 1 });

export const TrainingPlanModel = model<ITrainingPlan>('TrainingPlan', trainingPlanSchema);

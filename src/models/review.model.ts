import { Schema, model, Document, Types } from 'mongoose';
import { TrainerProfileModel } from './trainerProfile.model.js';

export interface IReview extends Document {
  authorId: Types.ObjectId;
  trainerId: Types.ObjectId;
  workoutPlanId?: Types.ObjectId;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String }
  },
  { timestamps: true }
);

export const ReviewModel = model<IReview>('Review', reviewSchema);

const updateTrainerRating = async (trainerId: Types.ObjectId) => {
  const stats = await ReviewModel.aggregate([
    { $match: { trainerId } },
    { $group: { _id: '$trainerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const { avgRating = 0, count = 0 } = stats[0] ?? {};
  await TrainerProfileModel.findOneAndUpdate(
    { userId: trainerId },
    { ratingAverage: avgRating, ratingCount: count },
    { upsert: true }
  );
};

reviewSchema.post('save', async function () {
  await updateTrainerRating(this.trainerId);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await updateTrainerRating(doc.trainerId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateTrainerRating(doc.trainerId);
});

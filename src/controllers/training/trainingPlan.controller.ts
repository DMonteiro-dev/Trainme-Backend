import { Request, Response } from 'express';
import { TrainingPlanModel } from '../../models/trainingPlan.model.js';
import { AppError } from '../../utils/appError.js';

export const trainingPlanController = {
    async create(req: Request, res: Response) {
        const plan = await TrainingPlanModel.create({
            ...req.body,
            trainerId: req.user?._id
        });
        res.status(201).json({ message: 'Training plan created', data: plan });
    },

    async list(req: Request, res: Response) {
        const { clientId, trainerId } = req.query;
        const query: any = { status: 'active' };

        if (clientId) query.clientId = clientId;
        if (trainerId) query.trainerId = trainerId;

        // If user is client, force clientId to be their own
        if (req.user?.role === 'client') {
            query.clientId = req.user._id;
        }

        const plans = await TrainingPlanModel.find(query)
            .populate('clientId', 'name email avatarUrl')
            .populate('trainerId', 'name email avatarUrl')
            .sort({ createdAt: -1 });

        res.json({ message: 'Training plans', data: plans });
    },

    async getById(req: Request, res: Response) {
        const plan = await TrainingPlanModel.findById(req.params.id)
            .populate('clientId', 'name email avatarUrl')
            .populate('trainerId', 'name email avatarUrl');

        if (!plan) throw new AppError('Plan not found', 404);

        res.json({ message: 'Training plan details', data: plan });
    },

    async update(req: Request, res: Response) {
        const plan = await TrainingPlanModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!plan) throw new AppError('Plan not found', 404);
        res.json({ message: 'Plan updated', data: plan });
    },

    async delete(req: Request, res: Response) {
        const plan = await TrainingPlanModel.findByIdAndUpdate(
            req.params.id,
            { status: 'archived' },
            { new: true }
        );
        if (!plan) throw new AppError('Plan not found', 404);
        res.json({ message: 'Plan archived', data: plan });
    }
};

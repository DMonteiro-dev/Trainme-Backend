import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ExerciseDefinitionModel, IExerciseDefinition } from '../../models/exerciseDefinition.model.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import { AuthenticatedRequest } from '../../types/express/index.js';

export const exerciseDefinitionController = {
    create: async (req: AuthenticatedRequest, res: Response) => {
        const { name, description, muscleGroup, equipment, difficulty, videoUrl } = req.body;

        // Check if exercise with same name exists
        const existing = await ExerciseDefinitionModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            throw new AppError('Exercise with this name already exists', 400);
        }

        const exercise = await ExerciseDefinitionModel.create({
            name,
            description,
            muscleGroup,
            equipment,
            difficulty,
            videoUrl,
            createdBy: req.user!.id,
            isSystem: false
        });

        return sendSuccess({ res, data: exercise, statusCode: 201 });
    },

    list: async (req: AuthenticatedRequest, res: Response) => {
        const { search, muscleGroup, equipment, difficulty } = req.query;
        const query: FilterQuery<IExerciseDefinition> = {};

        if (search) {
            query.$text = { $search: search as string };
        }
        if (muscleGroup) {
            query.muscleGroup = muscleGroup;
        }
        if (equipment) {
            query.equipment = equipment;
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Sort by name
        const exercises = await ExerciseDefinitionModel.find(query).sort('name');
        return sendSuccess({ res, data: exercises });
    },

    getById: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        const exercise = await ExerciseDefinitionModel.findById(id);
        if (!exercise) {
            throw new AppError('Exercise not found', 404);
        }
        return sendSuccess({ res, data: exercise });
    },

    update: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        const exercise = await ExerciseDefinitionModel.findById(id);

        if (!exercise) {
            throw new AppError('Exercise not found', 404);
        }

        // Only allow creator or admin to update
        if (exercise.createdBy?.toString() !== req.user!.id && req.user!.role !== 'admin') {
            throw new AppError('You do not have permission to update this exercise', 403);
        }

        const updated = await ExerciseDefinitionModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        return sendSuccess({ res, data: updated });
    },

    delete: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        const exercise = await ExerciseDefinitionModel.findById(id);

        if (!exercise) {
            throw new AppError('Exercise not found', 404);
        }

        // Only allow creator or admin to delete
        if (exercise.createdBy?.toString() !== req.user!.id && req.user!.role !== 'admin') {
            throw new AppError('You do not have permission to delete this exercise', 403);
        }

        await ExerciseDefinitionModel.findByIdAndDelete(id);
        return sendSuccess({ res, data: null, message: 'Exercise deleted successfully' });
    }
};

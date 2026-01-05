import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';
import { TrainingPlanModel } from '../models/trainingPlan.model.js';
import { trainingPlanService } from '../services/training/trainingPlan.service.js';
import { TrainingPlanAssignmentModel } from '../models/trainingPlanAssignment.model.js';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Trainer
        const trainer = await UserModel.create({
            name: 'Test Trainer',
            email: `trainer_${Date.now()}@test.com`,
            password: 'password123',
            role: 'trainer'
        });
        console.log('Trainer created:', trainer._id);

        // 2. Create Client
        const client = await UserModel.create({
            name: 'Test Client',
            email: `client_${Date.now()}@test.com`,
            password: 'password123',
            role: 'client',
            trainerId: trainer._id
        });
        console.log('Client created:', client._id);

        // 3. Create Plan
        const plan = await trainingPlanService.create(trainer._id.toString(), {
            name: 'Test Plan',
            difficulty: 'beginner',
            durationWeeks: 4
        });
        console.log('Plan created:', plan.id);

        // 4. Assign Plan
        console.log('Assigning plan...');
        const assignedPlan = await trainingPlanService.assignClients(
            plan.id,
            trainer._id.toString(),
            [client._id.toString()],
            new Date(),
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
        console.log('Plan assigned successfully.');

        // 5. Verify Assignment
        const assignment = await TrainingPlanAssignmentModel.findOne({
            planId: plan.id,
            clientId: client._id,
            status: 'active'
        });

        if (assignment) {
            console.log('Assignment verified:', assignment._id);
        } else {
            console.error('Assignment NOT found!');
        }

        // Cleanup
        await TrainingPlanAssignmentModel.deleteMany({ planId: plan.id });
        await TrainingPlanModel.deleteOne({ _id: plan.id });
        await UserModel.deleteOne({ _id: trainer._id });
        await UserModel.deleteOne({ _id: client._id });
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();

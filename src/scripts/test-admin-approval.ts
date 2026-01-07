
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { UserModel } from '../models/user.model.js';
import { TrainerChangeRequestModel } from '../models/trainerChangeRequest.model.js';
import { trainerChangeRequestService } from '../services/users/trainerChangeRequest.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const testAdminApproval = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        // 1. Setup Users
        const admin = await UserModel.findOne({ role: 'admin' });
        if (!admin) {
            console.error('No admin found. Create one first.');
            return;
        }
        console.log('Admin:', admin.email);

        const client = await UserModel.findOne({ role: 'client' });
        if (!client) {
            console.error('No client found');
            return;
        }
        console.log('Client:', client.email);

        const trainer = await UserModel.findOne({ role: 'trainer' });
        if (!trainer) {
            console.error('No trainer found');
            return;
        }
        console.log('Trainer:', trainer.email);

        // 2. Clear existing requests for this client
        await TrainerChangeRequestModel.deleteMany({ clientId: client._id });

        // 3. Create Request
        console.log('Creating request...');
        const request = await trainerChangeRequestService.create(client._id.toString(), {
            requestedTrainerId: trainer._id.toString(),
            reason: 'Test reason'
        });
        console.log('Request Created:', request.id, request.status);

        // 4. Approve Request as Admin
        console.log('Approving request...');
        const approved = await trainerChangeRequestService.approve(request.id, admin._id.toString());
        console.log('Request Approved:', approved.id, approved.status);

        if (approved.status === 'approved') {
            console.log('SUCCESS: Logic is working.');
        } else {
            console.error('FAILURE: Status did not update.');
        }

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testAdminApproval();

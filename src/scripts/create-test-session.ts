import mongoose from 'mongoose';
import { UserModel } from '../models/user.model.js';
import { SessionModel } from '../models/session.model.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const createTestSession = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trainme');
        console.log('Connected to MongoDB');

        const client = await UserModel.findOne({ email: 'testclient@trainme.com' });
        if (!client) {
            console.error('Test client not found');
            process.exit(1);
        }

        // Find a trainer (any trainer)
        const trainer = await UserModel.findOne({ role: 'trainer' });
        if (!trainer) {
            console.error('No trainer found');
            process.exit(1);
        }

        // Create session for today (starts in 1 hour)
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        const session = await SessionModel.create({
            client: client._id,
            trainer: trainer._id,
            startTime,
            endTime,
            notes: 'Sessão de Teste de Compliance',
            status: 'scheduled'
        });

        console.log('Session created:', session._id);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error creating session:', error);
        process.exit(1);
    }
};

createTestSession();

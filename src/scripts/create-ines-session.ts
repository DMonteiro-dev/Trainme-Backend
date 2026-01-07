import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model';
import { SessionModel } from '../models/session.model';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        // 1. Find or Create Ines
        let trainer = await UserModel.findOne({ name: /ines/i, role: 'trainer' });
        if (!trainer) {
            console.log('Creating trainer Ines...');
            trainer = await UserModel.create({
                name: 'Ines',
                email: 'ines@trainme.com',
                password: 'password123',
                role: 'trainer'
            });
        }
        console.log('Trainer:', trainer.name, trainer._id);

        // 2. Find Silva
        const client = await UserModel.findOne({ name: /silva/i, role: 'client' });
        if (!client) {
            throw new Error('Client Silva not found!');
        }
        console.log('Client:', client.name, client._id);

        // 3. Create Session NOW
        const session = await SessionModel.create({
            trainer: trainer._id,
            client: client._id,
            startTime: new Date(), // NOW
            endTime: new Date(Date.now() + 60 * 60 * 1000), // +1 Hour
            status: 'scheduled',
            notes: 'Test session for proof of workout'
        });

        console.log('Session Created:', session._id);
        console.log('Time:', session.startTime);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

createData();

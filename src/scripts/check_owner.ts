import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const trainerId = '691600f7d67aefd6a1b330bb';
        const user = await UserModel.findById(trainerId);
        console.log('Trainer:', user);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const trainerEmail = 'trainer@trainme.com';
        const trainer = await UserModel.findOne({ email: trainerEmail });

        if (trainer) {
            trainer.password = 'admin123';
            await trainer.save();
            console.log('Password reset for:', trainerEmail, 'ID:', trainer._id);
        } else {
            console.log('Trainer not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();

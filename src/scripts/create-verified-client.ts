import mongoose from 'mongoose';
import { UserModel } from '../models/user.model.js';
import { ClientProfileModel } from '../models/clientProfile.model.js';
import { SessionModel } from '../models/session.model.js'; // Ensure we can create a session too
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const createVerifiedClient = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trainme');
        console.log('Connected to MongoDB');

        const email = 'verified@trainme.com';
        const password = 'Password123!';

        // Cleanup if exists
        await UserModel.deleteOne({ email });

        // Create User
        const user = await UserModel.create({
            name: 'Verified Client',
            email,
            password,
            role: 'client',
            status: 'active'
        });

        // Create Profile
        await ClientProfileModel.create({
            userId: user._id,
        });

        console.log(`User created: ${email} / ${password}`);

        // Create a Session for this user
        const trainer = await UserModel.findOne({ role: 'trainer' });
        if (trainer) {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 2); // 2 hours ago (so it's "past" but not missed yet if logic allows, or simply open)
            // Actually, compliance modal works on past sessions too.
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 1);

            await SessionModel.create({
                client: user._id,
                trainer: trainer._id,
                startTime,
                endTime,
                status: 'scheduled', // or 'completed' to test logic? The modal is for completion.
                notes: 'Test Session for Verification'
            });
            console.log('Test session created for Verified Client');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createVerifiedClient();

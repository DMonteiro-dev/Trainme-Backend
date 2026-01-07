import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const listAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const users = await UserModel.find({}).select('_id name email role');
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
listAllUsers();

import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { UserModel } from '../models/user.model.js';

const reset = async () => {
    try {
        await connectDatabase();
        const email = 'trainer@trainme.com';
        const user = await UserModel.findOne({ email });
        if (user) {
            user.password = 'admin123';
            await user.save();
            console.log(`Password for ${email} reset to admin123`);
        } else {
            console.log(`User ${email} not found`);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await disconnectDatabase();
        process.exit(0);
    }
};

reset();

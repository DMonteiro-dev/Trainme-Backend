import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { UserModel } from '../models/user.model.js';

const testLogin = async () => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        const email = 'admin@trainme.com';
        const password = 'Password123!';

        console.log(`Searching for user: ${email}`);
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.error('❌ User NOT found!');
            return;
        }

        console.log('✅ User found:', user.email);
        console.log('Stored hashed password:', user.password);

        console.log(`Testing password: ${password}`);
        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            console.log('✅ Password MATCHES!');
        } else {
            console.error('❌ Password does NOT match!');
        }

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await disconnectDatabase();
    }
};

testLogin();

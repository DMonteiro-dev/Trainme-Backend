
import dotenv from 'dotenv';
import path from 'path';

// Specify the path to .env file assuming run from project root
dotenv.config();

import { sendEmail } from '../services/email/email.service';

const testEmail = async () => {
    console.log('Starting email test...');
    try {
        await sendEmail({
            to: 'davidf.monteiro.4@gmail.com', // Using the user's email for real test
            subject: 'Test Email from Script (API)',
            html: '<p>This is a test email via Mailtrap API.</p>',
        });
        console.log('Email test completed.');
    } catch (error) {
        console.error('Email test failed:', error);
    }
    process.exit(0);
};

testEmail();

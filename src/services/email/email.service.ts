import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

// Using Mailtrap API instead of SMTP to avoid port blocking
const token = process.env.MAILTRAP_TOKEN || process.env.EMAIL_PASS; // Using PASS as token fallback for now
const client = new MailtrapClient({ token: token || 'missing' });

const sender = {
    name: "TrainMe",
    email: process.env.EMAIL_FROM || "noreply@trainme.local",
};

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    console.log('[EmailService] Attempting to send email via Mailtrap API to:', to);

    if (!token) {
        console.warn('Mailtrap API Token not found. Email sending skipped.');
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${html}`);
        return;
    }

    try {
        await client.send({
            from: sender,
            to: [{ email: to }],
            subject,
            html,
            category: "Password Reset",
        });
        console.log('Email sent successfully via API');
    } catch (error) {
        console.error('Error sending email via API:', error);
        // Fallback logging
        console.log(`[MOCK EMAIL (Fallback)] To: ${to}, Subject: ${subject}, Body: ${html}`);
    }
};

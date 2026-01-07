import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    console.log('[EmailService] Attempting to send email to:', to);
    console.log('[EmailService] Config:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER ? '***' : 'missing',
        pass: process.env.EMAIL_PASS ? '***' : 'missing'
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not found in .env. Email sending skipped.');
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${html}`);
        return;
    }

    try {
        console.log('[EmailService] Sending via transporter...');
        const info = await transporter.sendMail({
            from: `"TrainMe" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to logging if sending fails
        console.log(`[MOCK EMAIL (Fallback)] To: ${to}, Subject: ${subject}, Body: ${html}`);
    }
};

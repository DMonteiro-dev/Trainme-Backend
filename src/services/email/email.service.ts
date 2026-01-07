import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
// If SERVICE is set (e.g. 'gmail'), use that. Otherwise use HOST/PORT.
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g. 'gmail'
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    console.log('[EmailService] Attempting to send email to:', to);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not found. Email sending skipped.');
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
        console.log(`[MOCK EMAIL (Fallback)] To: ${to}, Subject: ${subject}, Body: ${html}`);
    }
};

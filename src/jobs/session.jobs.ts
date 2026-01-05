import cron from 'node-cron';
import { SessionModel } from '../models/session.model.js';

export const initScheduledJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running auto-update for missed sessions...');
        try {
            const now = new Date();
            const result = await SessionModel.updateMany(
                {
                    status: 'scheduled',
                    endTime: { $lt: now }
                },
                {
                    $set: { status: 'missed' }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`Updated ${result.modifiedCount} sessions to missed.`);
            }
        } catch (error) {
            console.error('Error updating missed sessions:', error);
        }
    });

    console.log('Scheduled jobs initialized.');
};

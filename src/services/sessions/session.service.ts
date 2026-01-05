import { SessionModel, ISession } from '../../models/session.model.js';
import { CreateSessionDTO, SessionFilters } from '../../types/session.types.js';
import { Types } from 'mongoose';

export class SessionService {
    async create(data: Partial<ISession>) {
        const { trainer, startTime, endTime } = data;

        if (!trainer || !startTime || !endTime) {
            throw new Error('Trainer, startTime, and endTime are required');
        }

        const start = new Date(startTime);
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        if (start < oneHourFromNow) {
            throw new Error('As sessões devem ser agendadas com pelo menos 1 hora de antecedência.');
        }

        // Check for overlapping sessions for the TRAINER
        // Existing session starts before new ends AND ends after new starts
        const overlap = await SessionModel.findOne({
            trainer: trainer,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    // Case 1: Existing session starts during new session
                    startTime: { $lt: endTime, $gte: startTime }
                },
                {
                    // Case 2: Existing session costs during new session (ends after start)
                    endTime: { $gt: startTime, $lte: endTime }
                },
                {
                    // Case 3: Existing session engulfs new session
                    startTime: { $lte: startTime },
                    endTime: { $gte: endTime }
                }
            ]
        });

        if (overlap) {
            throw new Error('Trainer already has a session scheduled during this time');
        }

        const session = await SessionModel.create(data);

        try {
            const { getIO } = await import('../../socket/index.js');
            const io = getIO();
            // Allow notifying the client
            if (data.client) {
                io.to(data.client.toString()).emit('session_scheduled', {
                    trainerName: 'Seu Treinador', // ideally we fetch trainer name, but for MVP keep it simple or minimal
                    startTime: data.startTime,
                    sessionId: session._id
                });
            }
        } catch (error) {
            console.error('Socket emit error:', error);
        }

        // Create persistent notification
        try {
            if (data.client) {
                const { notificationService } = await import('../core/notification.service.js');
                await notificationService.create(
                    data.client.toString(),
                    'session_scheduled',
                    'Nova Sessão Agendada',
                    `O seu treinador agendou uma nova sessão para ${new Date(data.startTime!).toLocaleString('pt-PT')}`,
                    { sessionId: session._id, trainerId: data.trainer }
                );
            }
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        return session;
    }

    async list(filters: { trainerId?: string; clientId?: string; startDate?: string; endDate?: string }) {
        const query: any = { status: { $ne: 'cancelled' } };

        if (filters.trainerId) query.trainer = new Types.ObjectId(filters.trainerId);
        if (filters.clientId) query.client = new Types.ObjectId(filters.clientId);

        if (filters.startDate || filters.endDate) {
            query.startTime = {};
            if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
            if (filters.endDate) query.startTime.$lte = new Date(filters.endDate);
        }

        return SessionModel.find(query)
            .populate('client', 'name email avatarUrl')
            .populate('trainer', 'name email avatarUrl')
            .sort({ startTime: 1 });
    }

    async getById(id: string) {
        return SessionModel.findById(id)
            .populate('client', 'name email avatarUrl')
            .populate('trainer', 'name email avatarUrl');
    }

    async delete(id: string) {
        return SessionModel.findByIdAndDelete(id);
    }

    async update(id: string, data: Partial<ISession>) {
        const session = await SessionModel.findById(id).populate('client', 'name');
        if (!session) throw new Error('Session not found');

        // Enforce 24h limit for completion
        if (data.status === 'completed') {
            const now = new Date();
            const sessionTime = new Date(session.startTime);
            const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                throw new Error('Não é possível registar o treino após 24 horas da sessão.');
            }
        }

        // Notify Trainer on Missed Session
        if (data.status === 'missed' && session.status !== 'missed') {
            try {
                const { notificationService } = await import('../core/notification.service.js');
                const clientName = (session.client as any).name || 'Cliente';
                await notificationService.create(
                    session.trainer.toString(),
                    'system',
                    'Sessão Falhada - Alerta de Falta',
                    `O cliente ${clientName} não cumpriu o treino de ${new Date(session.startTime).toLocaleString('pt-PT')}. Motivo: ${data.failureReason || 'Não especificado'}.`,
                    { sessionId: session._id, clientId: (session.client as any)._id }
                );
            } catch (error) {
                console.error('Failed to notify trainer of missed session:', error);
            }
        }

        return SessionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async cancel(id: string) {
        return SessionModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    }

    async getStats(userId: string, role: 'client' | 'trainer') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const matchStage: any = {
            status: { $ne: 'cancelled' },
            startTime: { $gte: sixMonthsAgo }
        };

        if (role === 'client') {
            matchStage.client = new Types.ObjectId(userId);
        } else {
            matchStage.trainer = new Types.ObjectId(userId);
        }

        const stats = await SessionModel.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    weekly: [
                        {
                            $group: {
                                _id: {
                                    year: { $isoWeekYear: '$startTime' },
                                    week: { $isoWeek: '$startTime' }
                                },
                                total: { $sum: 1 },
                                completed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                                },
                                missed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
                                }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.week': 1 } }
                    ],
                    monthly: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$startTime' },
                                    month: { $month: '$startTime' }
                                },
                                total: { $sum: 1 },
                                completed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                                },
                                missed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
                                }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ]
                }
            }
        ]);

        return stats[0];
    }

}

export const sessionService = new SessionService();

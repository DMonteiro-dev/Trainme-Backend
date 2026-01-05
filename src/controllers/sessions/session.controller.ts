import { Request, Response } from 'express';
import { sessionService } from '../../services/sessions/session.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { CreateSessionDTO, SessionFilters } from '../../types/session.types.js';

export const createSession = catchAsync(async (req: Request, res: Response) => {
    const { clientId, startTime, endTime, notes } = req.body;
    // Cast to AuthenticatedRequest to safely access user, or assume middleware ensures it
    const trainerId = (req as AuthenticatedRequest).user?._id;

    // Basic validation could be moved to Zod middleware, keeping here for now or moving later
    if (!startTime || !endTime || !clientId) {
        throw new AppError('Missing required fields', 400);
    }

    try {
        const session = await sessionService.create({
            trainer: trainerId,
            client: clientId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            notes
        } as any);

        return sendSuccess({ res, data: session, message: 'Session created successfully', statusCode: 201 });
    } catch (error: any) {
        // Business logic errors from service should be caught and rethrown as AppError if needed, 
        // or handled by global error handler if they are standard errors.
        // Preserving specific overlap logic for now:
        if (error.message.includes('overlap') || error.message.includes('already has a session')) {
            throw new AppError(error.message, 409);
        }
        throw error;
    }
});

export const listSessions = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?._id.toString();
    const role = authReq.user?.role;

    const filters: SessionFilters = {
        startDate: startDate as string,
        endDate: endDate as string
    };

    if (role === 'trainer') {
        filters.trainerId = userId;
    } else {
        filters.clientId = userId;
    }

    const sessions = await sessionService.list(filters);
    return sendSuccess({ res, data: sessions, message: 'Sessions retrieved' });
});

export const deleteSession = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new AppError('Session ID is required', 400);

    await sessionService.delete(id);
    return sendSuccess({ res, message: 'Session deleted' });
});

export const updateSession = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new AppError('Session ID is required', 400);

    const updates = req.body;

    if (req.file) {
        updates.evidenceImage = `/uploads/${req.file.filename}`;
    }

    const session = await sessionService.update(id, updates);
    if (!session) {
        throw new AppError('Session not found', 404);
    }
    return sendSuccess({ res, data: session, message: 'Session updated' });
});

export const getStats = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { clientId } = req.query;

    let targetId = authReq.user!._id.toString();
    let targetRole: 'client' | 'trainer' = authReq.user!.role as 'client' | 'trainer';

    if (authReq.user!.role === 'trainer' && clientId) {
        targetId = clientId as string;
        targetRole = 'client';
    }

    const stats = await sessionService.getStats(targetId, targetRole);
    return sendSuccess({ res, data: stats });
});

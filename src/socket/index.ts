import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

interface SocketUser {
    sub: string;
    role: string;
}

declare module 'socket.io' {
    interface Socket {
        user?: SocketUser;
    }
}

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: env.CORS_ORIGINS,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    setIO(io);

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as SocketUser;
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user?.sub}`);

        // Join a room specific to the user
        const room = socket.user!.sub;
        socket.join(room);

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.user?.sub}`);
        });

        // Handle chat messages
        socket.on('send_message', (data) => {
            // data: { to: userId, content: string }
            // We will implement this later with database persistence
            const { to, content } = data;
            // Emit to the recipient
            io.to(to).emit('receive_message', {
                from: socket.user!.sub,
                content,
                timestamp: new Date(),
            });
        });
    });

    return io;
};

let io: Server;

export const setIO = (serverIo: Server) => {
    io = serverIo;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

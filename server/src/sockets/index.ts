import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://lifelink-client-coral.vercel.app',
        'http://localhost:3001',
      ],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token is required.'));
    }

    try {
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production_123456789';
      const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
      // Attach user info to the socket object
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired authentication token.'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    
    // Join the personal user room for targeted notifications
    const roomName = `user:${user.id}`;
    socket.join(roomName);
    
    logger.info(`Socket connected: User ${user.id} joined room ${roomName}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: User ${user.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io server is not initialized!');
  }
  return io;
};

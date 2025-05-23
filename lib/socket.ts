import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export const initSocket = () => {
  if (!io) {
    io = new SocketIOServer({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-auction', (auctionId: string) => {
        socket.join(`auction-${auctionId}`);
        console.log(`Client ${socket.id} joined auction ${auctionId}`);
      });

      socket.on('leave-auction', (auctionId: string) => {
        socket.leave(`auction-${auctionId}`);
        console.log(`Client ${socket.id} left auction ${auctionId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}; 
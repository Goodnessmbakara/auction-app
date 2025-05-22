import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

let io: SocketIOServer | null = null;

export async function GET() {
  try {
    if (!io) {
      io = new SocketIOServer({
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
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

    return new NextResponse('Socket.IO server initialized', { status: 200 });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Socket.IO server initialization failed', { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: Request) {
  try {
    const io = initSocket();
    return new NextResponse('Socket.IO server initialized', { status: 200 });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Socket.IO server initialization failed', { status: 500 });
  }
} 
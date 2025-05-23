import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempt: number;
  lastError: string | null;
}

export function useSocket(auctionId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isConnecting: true,
    reconnectAttempt: 0,
    lastError: null,
  });

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket',
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      autoConnect: true,
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        reconnectAttempt: 0,
        lastError: null,
      }));
      socketInstance.emit('join-auction', auctionId);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: error.message,
      }));
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setState(prev => ({
        ...prev,
        isConnecting: true,
        reconnectAttempt: attemptNumber,
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave-auction', auctionId);
      socketInstance.disconnect();
    };
  }, [auctionId]);

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  return { socket, state, reconnect };
} 
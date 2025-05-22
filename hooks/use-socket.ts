import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempt: number;
  lastError?: string;
}

export const useSocket = (auctionId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isConnecting: true,
    reconnectAttempt: 0,
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = async () => {
    try {
      setSocketState(prev => ({ ...prev, isConnecting: true }));
      
      // Initialize socket connection
      await fetch('/api/socket');
      
      socketRef.current = io({
        path: '/api/socket',
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: baseReconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      // Join auction room
      socketRef.current.emit('join-auction', auctionId);

      // Handle connection events
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket');
        setSocketState({
          isConnected: true,
          isConnecting: false,
          reconnectAttempt: 0,
        });
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        setSocketState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Handle reconnection based on reason
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          socketRef.current?.connect();
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setSocketState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          lastError: error.message,
          reconnectAttempt: prev.reconnectAttempt + 1,
        }));

        // Implement exponential backoff
        const delay = Math.min(
          baseReconnectDelay * Math.pow(2, socketState.reconnectAttempt),
          5000
        );

        if (socketState.reconnectAttempt < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${socketState.reconnectAttempt + 1}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        setSocketState(prev => ({
          ...prev,
          lastError: error.message,
        }));
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        setSocketState({
          isConnected: true,
          isConnecting: false,
          reconnectAttempt: 0,
        });
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
        setSocketState(prev => ({
          ...prev,
          isConnecting: true,
          reconnectAttempt: attemptNumber,
        }));
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        setSocketState(prev => ({
          ...prev,
          lastError: error.message,
        }));
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('Failed to reconnect after maximum attempts');
        setSocketState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          lastError: 'Failed to reconnect after maximum attempts',
        }));
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Failed to initialize socket',
      }));
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.emit('leave-auction', auctionId);
        socketRef.current.disconnect();
      }
    };
  }, [auctionId]);

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      connect();
    }
  };

  return {
    socket: socketRef.current,
    state: socketState,
    reconnect,
  };
}; 
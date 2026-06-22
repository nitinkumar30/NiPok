import { io, Socket } from 'socket.io-client';
import { TableInfo, TableState, Action } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  onTables(callback: (tables: TableInfo[]) => void): () => void {
    return this.on('tables', callback);
  }

  onTableState(callback: (state: TableState) => void): () => void {
    return this.on('tableState', callback);
  }

  onError(callback: (error: { message: string }) => void): () => void {
    return this.on('error', callback);
  }

  joinTable(tableId: string, playerName: string, sessionId: string) {
    this.emit('joinTable', { tableId, playerName, sessionId });
  }

  leaveTable() {
    this.emit('leaveTable');
  }

  playerAction(tableId: string, sessionId: string, action: Action, amount?: number) {
    this.emit('playerAction', { tableId, sessionId, action, amount });
  }

  startGame(tableId: string, sessionId: string) {
    this.emit('startGame', { tableId, sessionId });
  }

  private on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    };
  }

  private emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketManager = new SocketManager();

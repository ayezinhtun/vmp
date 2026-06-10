'use client';

import { io, Socket } from 'socket.io-client';
import type { WSEvent } from './types';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? '', {
      path:        '/api/socket.io',
      auth:        { token },
      transports:  ['websocket', 'polling'],
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socket.on('connect',       () => console.log('[ws] connected'));
    socket.on('disconnect',    (r) => console.log('[ws] disconnected:', r));
    socket.on('connect_error', (e) => console.warn('[ws] error:', e.message));
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function onVMEvent(sock: Socket, cb: (event: WSEvent) => void) {
  sock.on('vm:status',  (e: WSEvent) => cb(e));
  sock.on('vm:metrics', (e: WSEvent) => cb(e));
}

export function refreshVM(sock: Socket, vmId: number) {
  sock.emit('vm:refresh', { vmId });
}

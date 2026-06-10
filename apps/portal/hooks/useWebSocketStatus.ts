'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { getSocket } from '@/lib/websocket';

export function useWebSocketStatus() {
  const token = useAuth(s => s.accessToken);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const sock = getSocket(token);
    const on  = () => setConnected(true);
    const off = () => setConnected(false);
    sock.on('connect',    on);
    sock.on('disconnect', off);
    setConnected(sock.connected);
    return () => { sock.off('connect', on); sock.off('disconnect', off); };
  }, [token]);

  return connected;
}

'use client';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getSocket, onVMEvent, disconnectSocket } from '@/lib/websocket';
import { useVMStore } from '@/lib/store';
import { vmApi } from '@/lib/api-client';

export function useRealtimeVMs(token?: string) {
  const { setAllVMs, patchVM } = useVMStore();
  const socketRef = useRef<Socket | null>(null);

  // Initial fetch
  const { data } = useQuery({
    queryKey: ['vms'],
    queryFn:  vmApi.list,
    enabled:  !!token,
  });

  useEffect(() => {
    if (data) setAllVMs(data);
  }, [data, setAllVMs]);

  // WebSocket real-time patch
  useEffect(() => {
    if (!token) return;
    const sock = getSocket(token);
    socketRef.current = sock;

    onVMEvent(sock, (event) => {
      if (event.type === 'vm:status' && event.vmId) {
        patchVM(event.vmId, event.payload as any);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [token, patchVM]);

  return { socket: socketRef.current };
}

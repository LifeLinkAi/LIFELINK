'use client';
import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocket<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const cb = (data: T) => handlerRef.current(data);
    socket.on(event, cb);
    return () => { socket.off(event, cb); };
  }, [event]);
}

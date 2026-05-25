import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000',
      {
        auth: (cb) => cb({ token: Cookies.get('ll_access_token') }),
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
      }
    );
  }
  return socket;
};

export const connectSocket  = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};

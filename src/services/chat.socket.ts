import { io, type Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;
let activeSocketToken: string | null = null;
let pendingDisconnectTimer: number | null = null;

const SOCKET_PATH = '/socket.io';
const SOCKET_DISCONNECT_GRACE_MS = 150;

const normalizeEnvValue = (value: string | undefined) => value?.trim() ?? '';

const clearPendingDisconnect = () => {
  if (pendingDisconnectTimer !== null) {
    window.clearTimeout(pendingDisconnectTimer);
    pendingDisconnectTimer = null;
  }
};

const resolveSocketUrl = () => {
  const explicitSocketUrl = normalizeEnvValue(import.meta.env.VITE_CHAT_SOCKET_URL);
  if (explicitSocketUrl) {
    return explicitSocketUrl;
  }

  const backendBaseUrl = normalizeEnvValue(import.meta.env.VITE_API_BACKEND_BASE_URL);
  if (!backendBaseUrl) {
    return '';
  }

  try {
    return new URL(backendBaseUrl).origin;
  } catch {
    return backendBaseUrl;
  }
};

export const connectChatSocket = (token: string) => {
  const socketUrl = resolveSocketUrl();

  if (!socketUrl) {
    throw new Error('Chat socket URL is not configured.');
  }

  clearPendingDisconnect();

  if (chatSocket && activeSocketToken === token) {
    return chatSocket;
  }

  if (chatSocket) {
    chatSocket.disconnect();
  }

  chatSocket = io(socketUrl, {
    path: SOCKET_PATH,
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });
  activeSocketToken = token;

  return chatSocket;
};

export const disconnectChatSocket = (immediate = false) => {
  clearPendingDisconnect();

  const closeSocket = () => {
    if (chatSocket) {
      chatSocket.disconnect();
    }

    chatSocket = null;
    activeSocketToken = null;
    pendingDisconnectTimer = null;
  };

  if (immediate) {
    closeSocket();
    return;
  }

  pendingDisconnectTimer = window.setTimeout(() => {
    closeSocket();
  }, SOCKET_DISCONNECT_GRACE_MS);
};

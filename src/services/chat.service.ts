import { authorizedRequest, type AuthTokenSources } from './api.service';
import type {
  ChatMessage,
  ChatMessagePage,
  ChatReadPayload,
  ChatSendMessagePayload,
  Conversation,
  CreateDirectRoomPayload,
  LoadMessagesParams,
} from '../types/chat';
import { normalizeChatMessage, normalizeConversation } from '../utils/chat.mapper';

interface ChatRoomsResponse {
  success: boolean;
  message?: string;
  rooms?: unknown[];
  data?: unknown[] | { rooms?: unknown[] };
}

interface ChatRoomResponse {
  success: boolean;
  message?: string;
  room?: unknown;
  data?: unknown;
}

interface ChatMessagesResponse {
  success: boolean;
  message?: string;
  messages?: unknown[];
  data?: unknown[] | { messages?: unknown[]; hasMore?: boolean; before?: string | null };
  hasMore?: boolean;
  before?: string | null;
}

interface ChatMessageResponse {
  success: boolean;
  message?: string;
  chatMessage?: unknown;
  messageData?: unknown;
  data?: unknown;
  room?: unknown;
}

interface StartConversationPayload {
  peerUserId: string;
  text: string;
  clientMessageId?: string;
}

const generateClientMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getArrayFromUnknown = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'object' && value !== null && Array.isArray((value as { messages?: unknown[] }).messages)) {
    return (value as { messages: unknown[] }).messages;
  }

  if (typeof value === 'object' && value !== null && Array.isArray((value as { rooms?: unknown[] }).rooms)) {
    return (value as { rooms: unknown[] }).rooms;
  }

  return [];
};

const getMessagePayload = (response: ChatMessageResponse) => {
  if (response.chatMessage) {
    return response.chatMessage;
  }

  if (response.messageData) {
    return response.messageData;
  }

  if (response.data && typeof response.data === 'object' && response.data !== null) {
    const record = response.data as { message?: unknown };
    return record.message ?? response.data;
  }

  return response.data;
};

export const getChatRooms = async (
  auth: AuthTokenSources,
  currentUserId?: string | null,
  signal?: AbortSignal
): Promise<Conversation[]> => {
  const response = await authorizedRequest<ChatRoomsResponse>('/api/chat/rooms', {
    method: 'GET',
    auth,
    signal,
  });

  return getArrayFromUnknown(response.rooms ?? response.data).map((room) =>
    normalizeConversation(room, currentUserId)
  );
};

export const createDirectChatRoom = async (
  payload: CreateDirectRoomPayload,
  auth: AuthTokenSources,
  currentUserId?: string | null
): Promise<Conversation> => {
  const response = await authorizedRequest<ChatRoomResponse>('/api/chat/rooms/direct', {
    method: 'POST',
    auth,
    body: JSON.stringify(payload),
  });

  return normalizeConversation(response.room ?? response.data, currentUserId);
};

export const getChatRoomMessages = async (
  roomId: string,
  params: LoadMessagesParams,
  auth: AuthTokenSources,
  currentUserId?: string | null,
  signal?: AbortSignal
): Promise<ChatMessagePage> => {
  const searchParams = new URLSearchParams();

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.before) {
    searchParams.set('before', params.before);
  }

  if (params.since) {
    searchParams.set('since', params.since);
  }

  const queryString = searchParams.toString();
  const response = await authorizedRequest<ChatMessagesResponse>(
    `/api/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      auth,
      signal,
    }
  );
  const messages = getArrayFromUnknown(response.messages ?? response.data).map((message) =>
    normalizeChatMessage({ roomId, ...(message as Record<string, unknown>) }, currentUserId)
  );

  const responseData =
    typeof response.data === 'object' && response.data !== null
      ? (response.data as { hasMore?: boolean; before?: string | null })
      : null;

  return {
    messages,
    hasMore: response.hasMore ?? responseData?.hasMore ?? false,
    nextBefore: response.before ?? responseData?.before ?? null,
  };
};

export const sendChatMessage = async (
  roomId: string,
  payload: ChatSendMessagePayload,
  auth: AuthTokenSources,
  currentUserId?: string | null
): Promise<ChatMessage> => {
  const response = await authorizedRequest<ChatMessageResponse>(`/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    auth,
    body: JSON.stringify(payload),
  });

  return normalizeChatMessage(
    {
      roomId,
      ...(getMessagePayload(response) as Record<string, unknown>),
    },
    currentUserId
  );
};

export const markChatRoomRead = async (
  roomId: string,
  payload: ChatReadPayload,
  auth: AuthTokenSources
) => {
  await authorizedRequest<{ success: boolean; message?: string }>(`/api/chat/rooms/${roomId}/read`, {
    method: 'POST',
    auth,
    body: JSON.stringify(payload),
  });
};

export const startChatConversation = async (
  payload: StartConversationPayload,
  auth: AuthTokenSources,
  currentUserId?: string | null
): Promise<Conversation> => {
  const requestPayload: StartConversationPayload = {
    ...payload,
    clientMessageId: payload.clientMessageId ?? generateClientMessageId(),
  };

  const response = await authorizedRequest<ChatRoomResponse>('/api/chat/start-conversation', {
    method: 'POST',
    auth,
    body: JSON.stringify(requestPayload),
  });

  return normalizeConversation(response.room ?? response.data, currentUserId);
};

export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  roomId: string;
  text: string;
  senderUserId: string;
  sender: 'me' | 'them';
  createdAt: string;
  timestamp: string;
  status?: ChatMessageStatus;
  clientMessageId?: string;
  isOptimistic?: boolean;
  isReadByMe?: boolean;
  isDeliveredToMe?: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  image: string;
  online: boolean;
}

export interface Conversation {
  id: string;
  user: ChatUser;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage: ChatMessage | null;
  updatedAt: string | null;
  hasLoadedMessages: boolean;
  hasMoreMessages: boolean;
}

export interface ChatMessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
  nextBefore: string | null;
}

export interface ChatSendMessagePayload {
  text: string;
  clientMessageId?: string;
}

export interface ChatReadPayload {
  messageIds: string[];
}

export interface CreateDirectRoomPayload {
  peerUserId: string;
}

export interface LoadMessagesParams {
  limit?: number;
  before?: string;
  since?: string;
}

export interface ChatTypingEvent {
  roomId: string;
  isTyping: boolean;
  userId?: string;
}

export interface ChatSocketError {
  message?: string;
  code?: string;
  roomId?: string;
}

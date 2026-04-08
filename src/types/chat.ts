export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
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
}

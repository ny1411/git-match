import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation } from '../types/chat';
import { connectChatSocket, disconnectChatSocket } from '../services/chat.socket';
import {
  createDirectChatRoom,
  getChatRoomMessages,
  getChatRooms,
  markChatRoomRead,
  sendChatMessage,
} from '../services/chat.service';
import {
  createOptimisticChatMessage,
  getConversationId,
  mergeChatMessages,
  normalizeChatMessage,
  normalizeConversation,
  sortConversations,
  upsertConversation,
} from '../utils/chat.mapper';

interface UseChatOptions {
  authLoading: boolean;
  token?: string | null;
  firebaseToken?: string | null;
  userId?: string | null;
}

const DEFAULT_MESSAGES_LIMIT = 30;
const MESSAGE_SEND_REST_FALLBACK_MS = 5000;
const TYPING_RESET_MS = 1500;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const generateClientMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useChat = ({
  authLoading,
  token,
  firebaseToken,
  userId,
}: UseChatOptions) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [typingByRoom, setTypingByRoom] = useState<Record<string, boolean>>({});

  const activeChatIdRef = useRef<string | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  const socketRef = useRef<ReturnType<typeof connectChatSocket> | null>(null);
  const sendFallbackTimersRef = useRef<Record<string, number>>({});
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingEmittedRef = useRef(false);
  const loadRoomsRef = useRef<() => Promise<void>>(async () => {});

  const auth = useMemo(
    () => ({
      token,
      firebaseToken,
    }),
    [firebaseToken, token]
  );

  const activeChat = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) ?? null,
    [activeChatId, conversations]
  );

  const filteredConversations = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (!trimmedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const searchableText = [
        conversation.user.name,
        conversation.lastMessage?.text,
        conversation.lastMessage?.timestamp,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(trimmedQuery);
    });
  }, [conversations, searchQuery]);

  const updateConversation = useCallback(
    (roomId: string, updater: (conversation: Conversation) => Conversation) => {
      setConversations((previousConversations) => {
        const roomIndex = previousConversations.findIndex((conversation) => conversation.id === roomId);

        if (roomIndex < 0) {
          return previousConversations;
        }

        const nextConversations = [...previousConversations];
        nextConversations[roomIndex] = updater(previousConversations[roomIndex]);

        return sortConversations(nextConversations);
      });
    },
    []
  );

  const clearSendFallbackTimer = useCallback((clientMessageId?: string) => {
    if (!clientMessageId) {
      return;
    }

    const timer = sendFallbackTimersRef.current[clientMessageId];

    if (typeof timer === 'number') {
      window.clearTimeout(timer);
      delete sendFallbackTimersRef.current[clientMessageId];
    }
  }, []);

  const emitSocketEvent = useCallback((event: string, payload: Record<string, unknown>) => {
    const activeSocket = socketRef.current;

    if (!activeSocket?.connected) {
      return false;
    }

    activeSocket.emit(event, payload);
    return true;
  }, []);

  const acknowledgeMessages = useCallback(
    async (roomId: string, messageIds: string[]) => {
      if (!messageIds.length) {
        return;
      }

      updateConversation(roomId, (conversation) => ({
        ...conversation,
        unreadCount: 0,
        messages: conversation.messages.map((message) =>
          messageIds.includes(message.id)
            ? {
                ...message,
                isDeliveredToMe: true,
                isReadByMe: true,
              }
            : message
        ),
      }));

      messageIds.forEach((messageId) => {
        emitSocketEvent('chat:message:delivered', { roomId, messageId });
        emitSocketEvent('chat:message:read', { roomId, messageId });
      });

      try {
        await markChatRoomRead(roomId, { messageIds }, auth);
      } catch (error) {
        setChatError(getErrorMessage(error, 'Failed to update read receipts.'));
      }
    },
    [auth, emitSocketEvent, updateConversation]
  );

  const syncIncomingMessage = useCallback(
    (payload: unknown) => {
      const normalizedMessage = normalizeChatMessage(payload, userId);
      clearSendFallbackTimer(normalizedMessage.clientMessageId);
      const eventRoom =
        typeof payload === 'object' && payload !== null
          ? ((payload as { room?: unknown }).room ?? payload)
          : payload;
      const roomId = normalizedMessage.roomId || getConversationId(eventRoom);

      if (!roomId) {
        void loadRoomsRef.current();
        return;
      }

      const isActiveRoom = activeChatIdRef.current === roomId;

      setConversations((previousConversations) => {
        const existingConversation = previousConversations.find(
          (conversation) => conversation.id === roomId
        );

        if (!existingConversation) {
          const fallbackConversation = normalizeConversation(eventRoom, userId);
          if (!fallbackConversation.id) {
            return previousConversations;
          }

          return upsertConversation(previousConversations, {
            ...fallbackConversation,
            messages: mergeChatMessages(fallbackConversation.messages, [
              {
                ...normalizedMessage,
                roomId,
              },
            ]),
            lastMessage: {
              ...normalizedMessage,
              roomId,
            },
            updatedAt: normalizedMessage.createdAt,
            unreadCount:
              normalizedMessage.sender === 'them' && !isActiveRoom
                ? Math.max(fallbackConversation.unreadCount, 1)
                : 0,
            hasLoadedMessages: fallbackConversation.hasLoadedMessages || isActiveRoom,
          });
        }

        const mergedMessages = mergeChatMessages(existingConversation.messages, [
          {
            ...normalizedMessage,
            roomId,
          },
        ]);

        return upsertConversation(previousConversations, {
          ...existingConversation,
          messages: mergedMessages,
          lastMessage: mergedMessages[mergedMessages.length - 1] ?? existingConversation.lastMessage,
          updatedAt:
            mergedMessages[mergedMessages.length - 1]?.createdAt ?? existingConversation.updatedAt,
          unreadCount:
            normalizedMessage.sender === 'them' && !isActiveRoom
              ? existingConversation.unreadCount + 1
              : 0,
          hasLoadedMessages: existingConversation.hasLoadedMessages || isActiveRoom,
        });
      });

      if (normalizedMessage.sender === 'them' && isActiveRoom) {
        void acknowledgeMessages(roomId, [normalizedMessage.id]);
      }
    },
    [acknowledgeMessages, clearSendFallbackTimer, userId]
  );

  const persistMessageViaRest = useCallback(
    async (roomId: string, text: string, clientMessageId: string) => {
      try {
        const persistedMessage = await sendChatMessage(
          roomId,
          { text, clientMessageId },
          auth,
          userId
        );

        clearSendFallbackTimer(clientMessageId);

        updateConversation(roomId, (conversation) => {
          const mergedMessages = mergeChatMessages(conversation.messages, [persistedMessage]);

          return {
            ...conversation,
            messages: mergedMessages,
            lastMessage: mergedMessages[mergedMessages.length - 1] ?? conversation.lastMessage,
            updatedAt: persistedMessage.createdAt,
          };
        });
      } catch (error) {
        clearSendFallbackTimer(clientMessageId);
        updateConversation(roomId, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.clientMessageId === clientMessageId
              ? {
                  ...message,
                  status: 'failed',
                  isOptimistic: false,
                }
              : message
          ),
        }));
        setChatError(getErrorMessage(error, 'Failed to send message.'));
      }
    },
    [auth, clearSendFallbackTimer, updateConversation, userId]
  );

  const loadRooms = useCallback(async () => {
    if (!token && !firebaseToken) {
      setConversations([]);
      setActiveChatId(null);
      setIsRoomsLoading(false);
      return;
    }

    setIsRoomsLoading(true);
    setChatError(null);

    try {
      const fetchedRooms = await getChatRooms(auth, userId);
      const sortedRooms = sortConversations(fetchedRooms);
      setConversations(sortedRooms);
      setActiveChatId((currentActiveRoomId) => {
        if (currentActiveRoomId && sortedRooms.some((room) => room.id === currentActiveRoomId)) {
          return currentActiveRoomId;
        }

        return sortedRooms[0]?.id ?? null;
      });
    } catch (error) {
      setConversations([]);
      setChatError(getErrorMessage(error, 'Failed to load chat rooms.'));
    } finally {
      setIsRoomsLoading(false);
    }
  }, [auth, firebaseToken, token, userId]);

  const loadMessages = useCallback(
    async (roomId: string) => {
      if (!roomId) {
        return;
      }

      setIsMessagesLoading(true);

      try {
        const page = await getChatRoomMessages(
          roomId,
          { limit: DEFAULT_MESSAGES_LIMIT },
          auth,
          userId
        );

        updateConversation(roomId, (conversation) => {
          const mergedMessages = mergeChatMessages(conversation.messages, page.messages);

          return {
            ...conversation,
            messages: mergedMessages,
            lastMessage:
              conversation.lastMessage ?? mergedMessages[mergedMessages.length - 1] ?? null,
            updatedAt:
              conversation.updatedAt ??
              mergedMessages[mergedMessages.length - 1]?.createdAt ??
              null,
            hasLoadedMessages: true,
            hasMoreMessages: page.hasMore,
          };
        });
      } catch (error) {
        setChatError(getErrorMessage(error, 'Failed to load chat messages.'));
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [auth, updateConversation, userId]
  );

  const openConversation = useCallback((conversationId: string) => {
    setActiveChatId(conversationId);
    setChatError(null);
  }, []);

  const closeConversation = useCallback(() => {
    setActiveChatId(null);
    setTypingByRoom((previousTypingByRoom) => {
      if (!activeChatIdRef.current) {
        return previousTypingByRoom;
      }

      const nextTypingByRoom = { ...previousTypingByRoom };
      delete nextTypingByRoom[activeChatIdRef.current];
      return nextTypingByRoom;
    });
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = messageInput.trim();

    if (!trimmedMessage || !activeChatId) {
      return;
    }

    const clientMessageId = generateClientMessageId();
    const optimisticMessage = createOptimisticChatMessage({
      roomId: activeChatId,
      currentUserId: userId,
      text: trimmedMessage,
      clientMessageId,
    });

    setMessageInput('');
    setChatError(null);

    updateConversation(activeChatId, (conversation) => {
      const nextMessages = mergeChatMessages(conversation.messages, [optimisticMessage]);

      return {
        ...conversation,
        messages: nextMessages,
        lastMessage: nextMessages[nextMessages.length - 1] ?? conversation.lastMessage,
        updatedAt: optimisticMessage.createdAt,
      };
    });

    if (
      firebaseToken &&
      isRealtimeConnected &&
      emitSocketEvent('chat:message:send', {
        roomId: activeChatId,
        text: trimmedMessage,
        clientMessageId,
      })
    ) {
      sendFallbackTimersRef.current[clientMessageId] = window.setTimeout(() => {
        void persistMessageViaRest(activeChatId, trimmedMessage, clientMessageId);
      }, MESSAGE_SEND_REST_FALLBACK_MS);
      return;
    }

    void persistMessageViaRest(activeChatId, trimmedMessage, clientMessageId);
  }, [
    activeChatId,
    emitSocketEvent,
    firebaseToken,
    isRealtimeConnected,
    messageInput,
    persistMessageViaRest,
    updateConversation,
    userId,
  ]);

  const startDirectConversation = useCallback(
    async (peerUserId: string) => {
      const room = await createDirectChatRoom({ peerUserId }, auth, userId);

      setConversations((previousConversations) => upsertConversation(previousConversations, room));
      setActiveChatId(room.id);

      if (firebaseToken && isRealtimeConnected) {
        emitSocketEvent('chat:join', { peerUserId });
      }

      return room;
    },
    [auth, emitSocketEvent, firebaseToken, isRealtimeConnected, userId]
  );

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    loadRoomsRef.current = loadRooms;
  }, [loadRooms]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadRooms();
  }, [authLoading, loadRooms]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const room = conversations.find((conversation) => conversation.id === activeChatId);

    if (!room || room.hasLoadedMessages) {
      return;
    }

    void loadMessages(activeChatId);
  }, [activeChatId, conversations, loadMessages]);

  useEffect(() => {
    if (!activeChat) {
      return;
    }

    const unreadIncomingMessageIds = activeChat.messages
      .filter((message) => message.sender === 'them' && !message.isReadByMe)
      .map((message) => message.id);

    if (!unreadIncomingMessageIds.length) {
      return;
    }

    void acknowledgeMessages(activeChat.id, unreadIncomingMessageIds);
  }, [activeChat, acknowledgeMessages]);

  useEffect(() => {
    if (authLoading || !firebaseToken) {
      setIsRealtimeConnected(false);
      return;
    }

    let socket;

    try {
      socket = connectChatSocket(firebaseToken);
      socketRef.current = socket;
    } catch (error) {
      setChatError(getErrorMessage(error, 'Failed to connect to chat.'));
      setIsRealtimeConnected(false);
      return;
    }

    const handleConnect = () => {
      setIsRealtimeConnected(true);
    };

    const handleDisconnect = () => {
      setIsRealtimeConnected(false);
      setTypingByRoom({});
    };

    const handleReady = () => {
      setIsRealtimeConnected(true);
      socket.emit('chat:rooms:list', { limit: DEFAULT_MESSAGES_LIMIT });

      if (!activeChatIdRef.current) {
        return;
      }

      const currentConversation = conversationsRef.current.find(
        (conversation) => conversation.id === activeChatIdRef.current
      );

      socket.emit('chat:join', { roomId: activeChatIdRef.current });
      socket.emit('chat:sync', {
        roomId: activeChatIdRef.current,
        since: currentConversation?.lastMessage?.createdAt,
        limit: DEFAULT_MESSAGES_LIMIT,
      });
    };

    const handleMessageNew = (payload: unknown) => {
      syncIncomingMessage(payload);
    };

    const handleMessageUpdated = (payload: unknown) => {
      syncIncomingMessage(payload);
    };

    const handleTyping = (payload: { roomId?: string; isTyping?: boolean; userId?: string }) => {
      if (!payload.roomId || payload.userId === userId) {
        return;
      }

      setTypingByRoom((previousTypingByRoom) => ({
        ...previousTypingByRoom,
        [payload.roomId as string]: Boolean(payload.isTyping),
      }));
    };

    const handleSocketError = (payload: { message?: string }) => {
      if (payload.message) {
        setChatError(payload.message);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('chat:ready', handleReady);
    socket.on('chat:message:new', handleMessageNew);
    socket.on('chat:message:updated', handleMessageUpdated);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:error', handleSocketError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('chat:ready', handleReady);
      socket.off('chat:message:new', handleMessageNew);
      socket.off('chat:message:updated', handleMessageUpdated);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:error', handleSocketError);
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      disconnectChatSocket();
    };
  }, [authLoading, firebaseToken, syncIncomingMessage, userId]);

  useEffect(() => {
    if (!activeChatId || !firebaseToken || !isRealtimeConnected) {
      return;
    }

    emitSocketEvent('chat:join', { roomId: activeChatId });
    emitSocketEvent('chat:sync', {
      roomId: activeChatId,
      since: activeChat?.lastMessage?.createdAt,
      limit: DEFAULT_MESSAGES_LIMIT,
    });
  }, [
    activeChat?.lastMessage?.createdAt,
    activeChatId,
    emitSocketEvent,
    firebaseToken,
    isRealtimeConnected,
  ]);

  useEffect(() => {
    if (!activeChatId || !firebaseToken || !isRealtimeConnected) {
      isTypingEmittedRef.current = false;
      return;
    }

    const trimmedMessage = messageInput.trim();

    if (!trimmedMessage) {
      if (isTypingEmittedRef.current) {
        emitSocketEvent('chat:typing', { roomId: activeChatId, isTyping: false });
        isTypingEmittedRef.current = false;
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      return;
    }

    if (!isTypingEmittedRef.current) {
      emitSocketEvent('chat:typing', { roomId: activeChatId, isTyping: true });
      isTypingEmittedRef.current = true;
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      emitSocketEvent('chat:typing', { roomId: activeChatId, isTyping: false });
      isTypingEmittedRef.current = false;
    }, TYPING_RESET_MS);
  }, [activeChatId, emitSocketEvent, firebaseToken, isRealtimeConnected, messageInput]);

  useEffect(() => {
    return () => {
      Object.values(sendFallbackTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      disconnectChatSocket(true);
    };
  }, []);

  return {
    conversations: filteredConversations,
    activeChatId,
    activeChat,
    messageInput,
    searchQuery,
    isRoomsLoading,
    isMessagesLoading,
    chatError,
    isRealtimeConnected,
    isPeerTyping: activeChatId ? Boolean(typingByRoom[activeChatId]) : false,
    setMessageInput,
    setSearchQuery,
    openConversation,
    closeConversation,
    sendMessage: handleSendMessage,
    reloadRooms: loadRooms,
    startDirectConversation,
  };
};

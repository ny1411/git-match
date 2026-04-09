import type { ChatMessage, ChatMessageStatus, Conversation } from '../types/chat';

type UnknownRecord = Record<string, unknown>;

const DEFAULT_USER_NAME = 'GitMatch User';

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (trimmedValue) {
        return trimmedValue;
      }
    }
  }

  return undefined;
};

const getBoolean = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return undefined;
};

const getNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
};

const parseDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

const hasResolvableDate = (value: unknown) => Boolean(parseDate(value));

const toIsoString = (value: unknown, fallback = new Date()) => {
  const resolvedDate = parseDate(value) ?? fallback;
  return resolvedDate.toISOString();
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isYesterday = (candidate: Date, now: Date) => {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(candidate, yesterday);
};

const buildFallbackProfileImage = (name: string) => {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('') || 'GM';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f4c81" />
          <stop offset="100%" stop-color="#081018" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#bg)" />
      <text
        x="50%"
        y="54%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="52"
        font-weight="700"
        fill="#ffffff"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const includesUserId = (value: unknown, currentUserId?: string | null) => {
  if (!currentUserId) {
    return false;
  }

  return asArray(value).some((entry) => {
    if (typeof entry === 'string') {
      return entry === currentUserId;
    }

    const record = asRecord(entry);
    return (
      getString(record.uid, record.id, record.userId, record.memberId, record.participantId) ===
      currentUserId
    );
  });
};

const getPeerRecord = (value: unknown, currentUserId?: string | null) => {
  const record = asRecord(value);

  const directPeer =
    record.peerUser ??
    record.peer ??
    record.otherUser ??
    record.counterpart ??
    record.user ??
    record.participant;

  if (isRecord(directPeer)) {
    return directPeer;
  }

  const participants = asArray(record.participants ?? record.members ?? record.users);
  const matchingParticipant =
    participants.find((entry) => {
      const participantRecord = asRecord(entry);
      return (
        getString(
          participantRecord.uid,
          participantRecord.id,
          participantRecord.userId,
          participantRecord.memberId
        ) !== currentUserId
      );
    }) ?? participants[0];

  return asRecord(matchingParticipant);
};

export const getConversationId = (value: unknown) => {
  const record = asRecord(value);
  return getString(record.id, record.roomId, record.chatRoomId);
};

export const formatChatTimestamp = (value: unknown) => {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  const now = new Date();

  if (isSameDay(date, now)) {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(now.getDate() - 6);

  if (date > sixDaysAgo) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const resolveMessageStatus = (
  record: UnknownRecord,
  sender: ChatMessage['sender']
): ChatMessageStatus | undefined => {
  if (sender !== 'me') {
    return undefined;
  }

  const explicitStatus = getString(record.status, record.deliveryStatus);
  if (
    explicitStatus === 'sending' ||
    explicitStatus === 'sent' ||
    explicitStatus === 'delivered' ||
    explicitStatus === 'read' ||
    explicitStatus === 'failed'
  ) {
    return explicitStatus;
  }

  if (getBoolean(record.failed) || getBoolean(record.isFailed)) {
    return 'failed';
  }

  if (
    parseDate(record.readAt) ||
    parseDate(record.readOn) ||
    getBoolean(record.read) ||
    includesUserId(record.readBy, getString(record.recipientUserId, record.peerUserId))
  ) {
    return 'read';
  }

  if (
    parseDate(record.deliveredAt) ||
    parseDate(record.deliveredOn) ||
    getBoolean(record.delivered)
  ) {
    return 'delivered';
  }

  if (getBoolean(record.isOptimistic)) {
    return 'sending';
  }

  return 'sent';
};

export const normalizeChatMessage = (
  value: unknown,
  currentUserId?: string | null
): ChatMessage | null => {
  const record = asRecord(value);
  const roomRecord = asRecord(record.room);
  const senderRecord = asRecord(record.sender);
  const roomId = getString(record.roomId, roomRecord.id, roomRecord.roomId) ?? '';
  const text = getString(record.text, record.content, record.message, record.body) ?? '';
  const createdAtSource = record.createdAt ?? record.timestamp ?? record.sentAt ?? record.updatedAt;
  const hasCreatedAt = hasResolvableDate(createdAtSource);
  const rawMessageId = getString(record.id, record.messageId, record.clientMessageId);

  if (!roomId || !text || !hasCreatedAt || !rawMessageId) {
    return null;
  }

  const senderUserId =
    getString(
      record.senderUserId,
      record.senderId,
      senderRecord.uid,
      senderRecord.id,
      senderRecord.userId
    ) ?? '';
  const sender: ChatMessage['sender'] =
    currentUserId && senderUserId === currentUserId ? 'me' : 'them';
  const createdAt = toIsoString(createdAtSource);
  const messageId = rawMessageId;
  const clientMessageId = getString(record.clientMessageId);

  return {
    id: messageId,
    roomId,
    text,
    senderUserId,
    sender,
    createdAt,
    timestamp: formatChatTimestamp(createdAt),
    status: resolveMessageStatus(record, sender),
    clientMessageId,
    isOptimistic: getBoolean(record.isOptimistic) ?? false,
    isReadByMe:
      sender === 'them'
        ? getBoolean(record.isReadByMe, record.readByRecipient, record.read) ??
          includesUserId(record.readBy, currentUserId) ??
          Boolean(parseDate(record.readAt))
        : undefined,
    isDeliveredToMe:
      sender === 'them'
        ? getBoolean(record.isDeliveredToMe, record.deliveredToRecipient, record.delivered) ??
          includesUserId(record.deliveredTo, currentUserId) ??
          Boolean(parseDate(record.deliveredAt))
        : undefined,
  };
};

export const normalizeConversation = (
  value: unknown,
  currentUserId?: string | null
): Conversation => {
  const record = asRecord(value);
  const roomId = getConversationId(record) ?? '';
  const peerRecord = getPeerRecord(record, currentUserId);
  const peerName =
    getString(peerRecord.fullName, peerRecord.name, peerRecord.username, peerRecord.displayName) ??
    DEFAULT_USER_NAME;
  const messageRecords = asArray(record.messages)
    .map((message) =>
      normalizeChatMessage(
        {
          roomId,
          ...asRecord(message),
        },
        currentUserId
      )
    )
    .filter((message): message is ChatMessage => Boolean(message));
  const rawLastMessage = record.lastMessage ?? record.latestMessage;
  const normalizedLastMessage = rawLastMessage
    ? normalizeChatMessage(
        {
          roomId,
          ...asRecord(rawLastMessage),
        },
        currentUserId
      )
    : messageRecords[messageRecords.length - 1] ?? null;
  const updatedAtSource = record.updatedAt ?? normalizedLastMessage?.createdAt ?? record.createdAt;
  const updatedAt = hasResolvableDate(updatedAtSource) ? toIsoString(updatedAtSource) : null;

  return {
    id: roomId,
    user: {
      id: getString(peerRecord.uid, peerRecord.id, peerRecord.userId) ?? roomId,
      name: peerName,
      image:
        getString(
          peerRecord.profileImage,
          peerRecord.profileImageUrl,
          peerRecord.avatarUrl,
          peerRecord.image,
          peerRecord.photoUrl,
          peerRecord.photoURL
        ) ?? buildFallbackProfileImage(peerName),
      online:
        getBoolean(peerRecord.online, peerRecord.isOnline) ??
        getString(peerRecord.presence, peerRecord.status) === 'online',
    },
    messages: messageRecords,
    unreadCount: getNumber(record.unreadCount, record.unreadMessages, record.unread) ?? 0,
    lastMessage: normalizedLastMessage,
    updatedAt,
    hasLoadedMessages: messageRecords.length > 0,
    hasMoreMessages: getBoolean(record.hasMoreMessages, record.hasMore) ?? false,
  };
};

export const sortConversations = (conversations: Conversation[]) =>
  [...conversations].sort((left, right) => {
    const leftTimestamp = parseDate(left.updatedAt ?? left.lastMessage?.createdAt)?.getTime() ?? 0;
    const rightTimestamp =
      parseDate(right.updatedAt ?? right.lastMessage?.createdAt)?.getTime() ?? 0;

    return rightTimestamp - leftTimestamp;
  });

export const mergeChatMessages = (
  existingMessages: ChatMessage[],
  incomingMessages: ChatMessage[]
) => {
  const mergedMessages = [...existingMessages];

  incomingMessages
    .filter((incomingMessage) => Boolean(incomingMessage.id && incomingMessage.roomId && incomingMessage.text))
    .forEach((incomingMessage) => {
    const matchingMessageIndex = mergedMessages.findIndex(
      (message) =>
        message.id === incomingMessage.id ||
        (Boolean(message.clientMessageId) &&
          message.clientMessageId === incomingMessage.clientMessageId) ||
        (Boolean(incomingMessage.clientMessageId) &&
          message.id === `client:${incomingMessage.clientMessageId}`)
    );

    if (matchingMessageIndex >= 0) {
      mergedMessages[matchingMessageIndex] = {
        ...mergedMessages[matchingMessageIndex],
        ...incomingMessage,
        isOptimistic: incomingMessage.isOptimistic ?? false,
      };
      return;
    }

    mergedMessages.push(incomingMessage);
    });

  return mergedMessages.sort((left, right) => {
    const leftTimestamp = parseDate(left.createdAt)?.getTime() ?? 0;
    const rightTimestamp = parseDate(right.createdAt)?.getTime() ?? 0;

    if (leftTimestamp === rightTimestamp) {
      return left.id.localeCompare(right.id);
    }

    return leftTimestamp - rightTimestamp;
  });
};

export const createOptimisticChatMessage = ({
  roomId,
  currentUserId,
  text,
  clientMessageId,
}: {
  roomId: string;
  currentUserId?: string | null;
  text: string;
  clientMessageId: string;
}): ChatMessage => {
  const createdAt = new Date().toISOString();

  return {
    id: `client:${clientMessageId}`,
    roomId,
    text,
    senderUserId: currentUserId ?? '',
    sender: 'me',
    createdAt,
    timestamp: formatChatTimestamp(createdAt),
    status: 'sending',
    clientMessageId,
    isOptimistic: true,
  };
};

export const upsertConversation = (
  conversations: Conversation[],
  incomingConversation: Conversation
) => {
  const matchingConversationIndex = conversations.findIndex(
    (conversation) => conversation.id === incomingConversation.id
  );

  if (matchingConversationIndex < 0) {
    return sortConversations([...conversations, incomingConversation]);
  }

  const existingConversation = conversations[matchingConversationIndex];
  const mergedMessages = mergeChatMessages(
    existingConversation.messages,
    incomingConversation.messages
  );
  const lastMessage =
    incomingConversation.lastMessage ??
    mergedMessages[mergedMessages.length - 1] ??
    existingConversation.lastMessage;
  const nextConversation: Conversation = {
    ...existingConversation,
    ...incomingConversation,
    messages: mergedMessages,
    lastMessage,
    updatedAt: incomingConversation.updatedAt ?? lastMessage?.createdAt ?? existingConversation.updatedAt,
    hasLoadedMessages:
      incomingConversation.hasLoadedMessages || existingConversation.hasLoadedMessages,
  };
  const nextConversations = [...conversations];
  nextConversations[matchingConversationIndex] = nextConversation;
  return sortConversations(nextConversations);
};

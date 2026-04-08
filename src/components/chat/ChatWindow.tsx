import { ArrowLeft, ImageIcon, MoreVertical, Phone, Send, Smile, Video } from 'lucide-react';
import type { FC, KeyboardEvent } from 'react';
import type { Conversation } from '../../types/chat';
import MessageStatusIcon from './MessageStatusIcon';

interface ChatWindowProps {
  activeChat: Conversation | null;
  messageInput: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  isRealtimeConnected?: boolean;
  isPeerTyping?: boolean;
  onBack: () => void;
  onMessageInputChange: (value: string) => void;
  onRetry: () => void;
  onSendMessage: () => void;
}

const ChatWindow: FC<ChatWindowProps> = ({
  activeChat,
  messageInput,
  isLoading = false,
  errorMessage,
  isRealtimeConnected = false,
  isPeerTyping = false,
  onBack,
  onMessageInputChange,
  onRetry,
  onSendMessage,
}) => {
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="hidden h-full flex-1 items-center justify-center bg-black/20 p-8 text-center md:flex">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Send className="ml-1 text-cyan-400" size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Your Messages</h2>
          <p className="max-w-sm text-gray-400">
            Select a match from the left to start a conversation or continue where you left off.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative flex flex-1 flex-col">
      <div className="z-10 flex shrink-0 items-center justify-between border-b border-white/5 bg-black/20 p-4 backdrop-blur-md md:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-white md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <img
              src={activeChat.user.image}
              alt={activeChat.user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="leading-tight font-bold text-white">{activeChat.user.name}</h2>
            <p className="text-xs text-gray-400">
              {isPeerTyping
                ? 'Typing...'
                : activeChat.user.online
                  ? 'Online now'
                  : isRealtimeConnected
                    ? 'Offline'
                    : 'Realtime unavailable'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400 md:gap-4">
          <button className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white">
            <Phone size={18} />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white">
            <Video size={18} />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col space-y-4 overflow-y-auto p-4 md:p-6">
        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-950/40 p-4 text-sm text-red-100">
            <p>{errorMessage}</p>
            <button
              onClick={onRetry}
              className="mt-3 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="my-4 flex justify-center">
          <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400 backdrop-blur-sm">
            {isRealtimeConnected ? 'Live chat' : 'Connecting...'}
          </span>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-400">Loading messages...</div>
        ) : null}

        {!isLoading && activeChat.messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-400">
            No messages yet. Say hello to start the conversation.
          </div>
        ) : null}

        {activeChat.messages.map((message) => {
          const isCurrentUser = message.sender === 'me';

          return (
            <div
              key={message.id}
              className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[75%] flex-col md:max-w-[60%] ${
                  isCurrentUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                    isCurrentUser
                      ? 'rounded-br-sm bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                      : 'rounded-bl-sm border border-white/5 bg-white/10 text-gray-100'
                  }`}
                >
                  {message.text}
                </div>
                <div className="mt-1 flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-medium text-gray-500">{message.timestamp}</span>
                  {isCurrentUser ? <MessageStatusIcon status={message.status} /> : null}
                </div>
              </div>
            </div>
          );
        })}

        {isPeerTyping ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-white/5 bg-white/10 px-4 py-2.5 text-sm text-gray-300">
              {activeChat.user.name} is typing...
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-white/5 bg-black/20 p-4 backdrop-blur-md md:p-6">
        <div className="relative flex items-center rounded-full border border-white/10 bg-white/5 p-1.5 shadow-lg">
          <button className="rounded-full p-2.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <Smile size={20} />
          </button>
          <button className="rounded-full p-2.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            value={messageInput}
            onChange={(event) => onMessageInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
          />

          <button
            disabled={!messageInput.trim()}
            onClick={onSendMessage}
            className="ml-2 flex h-10 aspect-square items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <Send size={16} className="mr-[2px] mt-[1px]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatWindow;

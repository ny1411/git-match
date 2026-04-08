import { ArrowLeft, Search } from 'lucide-react';
import type { FC } from 'react';
import type { Conversation } from '../../types/chat';
import MessageStatusIcon from './MessageStatusIcon';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onBack: () => void;
  onSelectConversation: (conversationId: string) => void;
}

const ChatSidebar: FC<ChatSidebarProps> = ({
  conversations,
  activeChatId,
  onBack,
  onSelectConversation,
}) => {
  return (
    <aside
      className={`w-full flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl md:w-80 lg:w-96 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="flex shrink-0 items-center gap-4 border-b border-white/5 p-6">
        <button
          onClick={onBack}
          className="-ml-2 rounded-full p-2 text-white transition-colors hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-wide text-white">Messages</h1>
      </div>

      <div className="shrink-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search matches..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder-gray-500 transition-all focus:bg-white/10 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          const isActive = activeChatId === conversation.id;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`flex w-full items-center gap-4 border-b border-l-4 border-white/5 p-4 transition-colors ${
                isActive
                  ? 'border-l-cyan-400 bg-white/10'
                  : 'border-l-transparent hover:bg-white/5'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conversation.user.image}
                  alt={conversation.user.name}
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                />
                {conversation.user.online ? (
                  <div className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-[#120b18] bg-green-500" />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col items-start overflow-hidden">
                <div className="mb-1 flex w-full items-center justify-between">
                  <span className="truncate font-bold text-white">{conversation.user.name}</span>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      conversation.unreadCount > 0 ? 'font-semibold text-cyan-300' : 'text-gray-500'
                    }`}
                  >
                    {lastMessage?.timestamp}
                  </span>
                </div>

                <div className="flex w-full items-center justify-between gap-2">
                  <p
                    className={`truncate text-sm ${
                      conversation.unreadCount > 0 ? 'font-medium text-white' : 'text-gray-400'
                    }`}
                  >
                    {lastMessage?.sender === 'me' ? 'You: ' : ''}
                    {lastMessage?.text}
                  </p>

                  {conversation.unreadCount > 0 ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-[10px] font-bold text-white shadow-lg">
                      {conversation.unreadCount}
                    </div>
                  ) : lastMessage?.sender === 'me' ? (
                    <MessageStatusIcon status={lastMessage.status} />
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSidebar;

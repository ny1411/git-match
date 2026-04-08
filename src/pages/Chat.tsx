import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import BgGradient from '../components/ui/BgGradient';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';

const Chat: FC = () => {
  const navigate = useNavigate();
  const { userProfile, token, firebaseToken, isLoading: authLoading } = useAuth();
  const {
    conversations,
    activeChatId,
    activeChat,
    messageInput,
    searchQuery,
    isRoomsLoading,
    isMessagesLoading,
    chatError,
    isRealtimeConnected,
    isPeerTyping,
    setMessageInput,
    setSearchQuery,
    openConversation,
    closeConversation,
    sendMessage,
    reloadRooms,
  } = useChat({
    authLoading,
    token,
    firebaseToken,
    userId: userProfile?.uid,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-sm text-gray-300">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black/30 font-['Inter',_sans-serif] text-gray-200">
      <BgGradient />

      <main className="relative z-10 flex h-dvh w-full overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          searchQuery={searchQuery}
          isLoading={isRoomsLoading}
          errorMessage={chatError}
          onBack={() => {
            navigate('/dashboard');
          }}
          onRetry={reloadRooms}
          onSearchQueryChange={setSearchQuery}
          onSelectConversation={openConversation}
        />

        <div className={`flex flex-1 flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow
            activeChat={activeChat}
            messageInput={messageInput}
            isLoading={isMessagesLoading}
            errorMessage={chatError}
            isRealtimeConnected={isRealtimeConnected}
            isPeerTyping={isPeerTyping}
            onBack={closeConversation}
            onMessageInputChange={setMessageInput}
            onRetry={reloadRooms}
            onSendMessage={sendMessage}
          />
        </div>
      </main>
    </div>
  );
};

export default Chat;

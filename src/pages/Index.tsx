
import React from 'react';
import { PeerProvider } from '@/contexts/PeerContext';
import NicknameForm from '@/components/NicknameForm';
import ChatInterface from '@/components/ChatInterface';
import { usePeer } from '@/contexts/PeerContext';

const ChatApp: React.FC = () => {
  const { isInitialized } = usePeer();

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gradient-to-br from-white to-chat-purple-light">
      <div className="w-full max-w-2xl">
        {!isInitialized ? (
          <NicknameForm />
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <PeerProvider>
      <ChatApp />
    </PeerProvider>
  );
};

export default Index;

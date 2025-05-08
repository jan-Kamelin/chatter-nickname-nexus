
import React from 'react';
import { Card } from '@/components/ui/card';
import ChatList from './ChatList';
import ChatInput from './ChatInput';
import ConnectionForm from './ConnectionForm';
import ActiveConnections from './ActiveConnections';
import { usePeer } from '@/contexts/PeerContext';

const ChatInterface: React.FC = () => {
  const { nickname, connectionStatus } = usePeer();

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden flex flex-col shadow-lg animate-fade-in h-[600px] max-h-[80vh]">
      <div className="bg-chat-purple text-white p-4">
        <h2 className="font-bold">P2P Chat</h2>
        <div className="text-sm opacity-80">
          Welcome, {nickname}! {' '}
          <span className="inline-flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
            </span>
            {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
      
      <ConnectionForm />
      <ActiveConnections />
      
      <ChatList />
      <ChatInput />
    </Card>
  );
};

export default ChatInterface;


import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { usePeer } from '@/contexts/PeerContext';

const ChatList: React.FC = () => {
  const { messages } = usePeer();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
          <div>
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Connect with someone to start chatting!</p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <ChatBubble 
          key={message.id} 
          content={message.content} 
          isMe={message.sender === 'You'} 
          sender={message.sender}
          timestamp={message.timestamp}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatList;

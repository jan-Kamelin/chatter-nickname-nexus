
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  content: string;
  isMe: boolean;
  sender: string;
  timestamp: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  content, 
  isMe,
  sender, 
  timestamp
}) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <div className={cn(
      "flex flex-col max-w-[75%] animate-fade-in",
      isMe ? "self-end items-end" : "self-start items-start"
    )}>
      <div className="text-xs text-muted-foreground mb-1">
        {isMe ? "You" : sender}
      </div>
      
      <div className={cn(
        "p-3 rounded-lg",
        isMe 
          ? "bg-chat-purple text-white rounded-br-none" 
          : "bg-chat-gray text-chat-text rounded-bl-none"
      )}>
        <p className="break-words whitespace-pre-wrap">{content}</p>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        {formattedTime}
      </div>
    </div>
  );
};

export default ChatBubble;

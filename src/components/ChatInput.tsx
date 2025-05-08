
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { usePeer } from '@/contexts/PeerContext';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, connections } = usePeer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder={connections.length > 0 ? "Type your message..." : "Connect to someone to start chatting"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={connections.length === 0}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || connections.length === 0}
          className="bg-chat-purple hover:bg-chat-purple-dark text-white"
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;

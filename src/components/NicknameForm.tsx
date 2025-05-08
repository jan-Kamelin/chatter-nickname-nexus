
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { usePeer } from '@/contexts/PeerContext';

const NicknameForm: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { setNickname, initializePeer } = usePeer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setNickname(inputValue.trim());
      initializePeer();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-chat-text">Welcome to P2P Chat</CardTitle>
        <CardDescription>
          Choose a nickname to start chatting with others
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your nickname"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border-chat-purple focus:border-chat-purple-dark"
              maxLength={20}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-chat-purple hover:bg-chat-purple-dark text-white"
            disabled={!inputValue.trim()}
          >
            Join Chat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NicknameForm;

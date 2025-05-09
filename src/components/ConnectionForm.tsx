
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { usePeer } from '@/contexts/PeerContext';
import { Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ConnectionForm: React.FC = () => {
  const { nickname, connectToPeer } = usePeer();
  const [remotePeerName, setRemotePeerName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remotePeerName.trim()) {
      connectToPeer(remotePeerName.trim());
      setRemotePeerName('');
    }
  };

  const handleCopyNickname = () => {
    navigator.clipboard.writeText(nickname);
    toast({
      title: "Copied to clipboard",
      description: "Your nickname has been copied to clipboard."
    });
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 text-sm bg-chat-gray p-2 rounded-md overflow-hidden truncate">
              <span className="font-semibold mr-1">Your nickname:</span>
              <span className="font-mono">{nickname}</span>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="flex-shrink-0"
              onClick={handleCopyNickname}
            >
              <Copy size={16} />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter nickname to connect"
              value={remotePeerName}
              onChange={(e) => setRemotePeerName(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-chat-purple hover:bg-chat-purple-dark text-white"
              disabled={!remotePeerName.trim()}
            >
              Connect
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionForm;

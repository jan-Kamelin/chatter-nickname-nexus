
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePeer } from '@/contexts/PeerContext';
import { User, X } from 'lucide-react';

const ActiveConnections: React.FC = () => {
  const { connections, disconnectFromPeer } = usePeer();

  if (connections.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-b p-2 bg-chat-gray">
      <div className="flex items-center space-x-2 px-2">
        <User size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Connected with:</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {connections.map((connection) => (
          <div 
            key={connection.peerId} 
            className="flex items-center bg-white rounded-full pl-3 pr-1 py-1 text-sm shadow-sm"
          >
            <span className="mr-1">{connection.nickname}</span>
            <Button
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded-full hover:bg-gray-100"
              onClick={() => disconnectFromPeer(connection.peerId)}
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveConnections;

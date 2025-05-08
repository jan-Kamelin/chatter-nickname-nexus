
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Peer from 'peerjs';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface Connection {
  peerId: string;
  nickname: string;
  conn: any; // PeerJS connection
}

interface PeerContextType {
  peer: Peer | null;
  myPeerId: string;
  nickname: string;
  connections: Connection[];
  messages: Message[];
  isInitialized: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  setNickname: (name: string) => void;
  initializePeer: () => void;
  connectToPeer: (remotePeerId: string) => void;
  sendMessage: (content: string) => void;
  disconnectFromPeer: (peerId: string) => void;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (context === undefined) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};

interface PeerProviderProps {
  children: ReactNode;
}

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const initializePeer = () => {
    if (peer || !nickname) return;

    setConnectionStatus('connecting');

    try {
      const newPeer = new Peer();

      newPeer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        setMyPeerId(id);
        setIsInitialized(true);
        setConnectionStatus('connected');
      });

      newPeer.on('connection', (conn) => {
        handleConnection(conn);
      });

      newPeer.on('error', (err) => {
        console.error('Peer error:', err);
        setConnectionStatus('disconnected');
      });

      setPeer(newPeer);
    } catch (error) {
      console.error('Failed to initialize peer:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleConnection = (conn: any) => {
    conn.on('open', () => {
      // Exchange nicknames
      conn.send({ type: 'nickname', nickname });

      conn.on('data', (data: any) => {
        if (data.type === 'nickname') {
          // Add connection to our list
          setConnections(prev => [...prev, {
            peerId: conn.peer,
            nickname: data.nickname,
            conn
          }]);
          
          // Confirm nickname reception
          conn.send({ type: 'nickname-received' });
        } else if (data.type === 'nickname-received') {
          // Connection is fully established
          console.log(`Connection with ${conn.peer} established`);
        } else if (data.type === 'message') {
          // Handle incoming message
          const newMessage: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: data.nickname,
            content: data.content,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, newMessage]);
        }
      });

      conn.on('close', () => {
        // Remove the connection from our list
        setConnections(prev => prev.filter(c => c.peerId !== conn.peer));
      });
    });
  };

  const connectToPeer = (remotePeerId: string) => {
    if (!peer || !remotePeerId) return;

    try {
      const conn = peer.connect(remotePeerId);
      handleConnection(conn);
    } catch (error) {
      console.error('Failed to connect to peer:', error);
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || connections.length === 0) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'You',
      content,
      timestamp: Date.now()
    };

    // Add to local messages
    setMessages(prev => [...prev, newMessage]);

    // Send to all connections
    connections.forEach(connection => {
      connection.conn.send({
        type: 'message',
        content,
        nickname
      });
    });
  };

  const disconnectFromPeer = (peerId: string) => {
    const connection = connections.find(c => c.peerId === peerId);
    if (connection) {
      connection.conn.close();
      setConnections(prev => prev.filter(c => c.peerId !== peerId));
    }
  };

  useEffect(() => {
    return () => {
      // Clean up peer connection on unmount
      if (peer) {
        connections.forEach(conn => conn.conn.close());
        peer.destroy();
      }
    };
  }, [peer, connections]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        myPeerId,
        nickname,
        connections,
        messages,
        isInitialized,
        connectionStatus,
        setNickname,
        initializePeer,
        connectToPeer,
        sendMessage,
        disconnectFromPeer
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

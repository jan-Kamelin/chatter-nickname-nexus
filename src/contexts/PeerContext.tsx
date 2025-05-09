
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

// Global nickname to peerId mapping
interface NicknameRegistry {
  [nickname: string]: string; // nickname -> peerId
}

interface PeerContextType {
  peer: Peer | null;
  myPeerId: string;
  nickname: string;
  connections: Connection[];
  messages: Message[];
  isInitialized: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  nicknameRegistry: NicknameRegistry;
  setNickname: (name: string) => void;
  initializePeer: () => void;
  connectToPeer: (remotePeerIdOrNickname: string) => void;
  sendMessage: (content: string) => void;
  disconnectFromPeer: (peerId: string) => void;
  registerNickname: (nickname: string, peerId: string) => void;
  lookupPeerId: (nickname: string) => string | undefined;
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
  const [nicknameRegistry, setNicknameRegistry] = useState<NicknameRegistry>({});

  const registerNickname = (userNickname: string, peerId: string) => {
    setNicknameRegistry(prev => ({
      ...prev,
      [userNickname]: peerId
    }));
  };

  const lookupPeerId = (userNickname: string): string | undefined => {
    return nicknameRegistry[userNickname];
  };

  const initializePeer = () => {
    if (peer || !nickname) return;

    setConnectionStatus('connecting');

    try {
      const newPeer = new Peer();

      newPeer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        setMyPeerId(id);
        // Register my own nickname and ID
        registerNickname(nickname, id);
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
      conn.send({ 
        type: 'nickname', 
        nickname,
        nicknameRegistry: nicknameRegistry // Send our registry to the other peer
      });

      conn.on('data', (data: any) => {
        if (data.type === 'nickname') {
          // Add connection to our list
          setConnections(prev => [...prev, {
            peerId: conn.peer,
            nickname: data.nickname,
            conn
          }]);
          
          // Update our registry with their registry
          if (data.nicknameRegistry) {
            setNicknameRegistry(prev => ({
              ...prev,
              ...data.nicknameRegistry
            }));
          }
          
          // Register the new peer's nickname
          registerNickname(data.nickname, conn.peer);
          
          // Confirm nickname reception
          conn.send({ 
            type: 'nickname-received',
            nicknameRegistry: nicknameRegistry // Send our updated registry
          });
        } else if (data.type === 'nickname-received') {
          // Connection is fully established
          console.log(`Connection with ${conn.peer} established`);
          
          // Update our registry with their registry
          if (data.nicknameRegistry) {
            setNicknameRegistry(prev => ({
              ...prev,
              ...data.nicknameRegistry
            }));
          }
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

  const connectToPeer = (remotePeerIdOrNickname: string) => {
    if (!peer || !remotePeerIdOrNickname) return;

    try {
      // First check if this is a nickname in our registry
      const peerId = lookupPeerId(remotePeerIdOrNickname) || remotePeerIdOrNickname;
      
      // Don't connect to ourselves
      if (peerId === myPeerId) {
        console.error("Cannot connect to yourself");
        return;
      }
      
      // Check if we're already connected to this peer
      if (connections.some(c => c.peerId === peerId)) {
        console.log("Already connected to this peer");
        return;
      }
      
      const conn = peer.connect(peerId);
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
        nicknameRegistry,
        setNickname,
        initializePeer,
        connectToPeer,
        sendMessage,
        disconnectFromPeer,
        registerNickname,
        lookupPeerId
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

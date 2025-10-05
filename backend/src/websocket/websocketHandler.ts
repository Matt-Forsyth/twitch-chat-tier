import { WebSocketServer, WebSocket } from 'ws';
import { verifyTwitchToken } from '../services/twitchAuth';

interface Client {
  ws: WebSocket;
  userId: string;
  channelId: string;
  role: string;
}

const clients = new Map<string, Client>();

export const initializeWebSocket = (wss: WebSocketServer): void => {
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    let clientId: string | null = null;
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth') {
          // Authenticate the client
          const token = data.token;
          const decoded = verifyTwitchToken(token);
          
          clientId = `${decoded.channel_id}_${decoded.user_id}`;
          clients.set(clientId, {
            ws,
            userId: decoded.user_id,
            channelId: decoded.channel_id,
            role: decoded.role,
          });
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId: decoded.user_id,
            channelId: decoded.channel_id,
            role: decoded.role,
          }));
          
          console.log(`Client authenticated: ${clientId}`);
        } else if (data.type === 'vote_update') {
          // Broadcast vote update to all clients in the same channel
          const client = clientId ? clients.get(clientId) : null;
          if (client) {
            broadcastToChannel(client.channelId, {
              type: 'vote_update',
              data: data.data,
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Send heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);
  });
};

/**
 * Broadcast a message to all clients in a specific channel
 */
export const broadcastToChannel = (channelId: string, message: any): void => {
  clients.forEach((client) => {
    if (client.channelId === channelId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
};

/**
 * Send a message to a specific user
 */
export const sendToUser = (channelId: string, userId: string, message: any): void => {
  const clientId = `${channelId}_${userId}`;
  const client = clients.get(clientId);
  
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
};

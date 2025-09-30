import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string, userId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8080${url}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setNotifications(prev => [data, ...prev]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [url, userId]);

  const sendMessage = (message: any) => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, notifications, sendMessage };
};
import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GATEWAY_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GATEWAY_URL
  ? String(import.meta.env.VITE_GATEWAY_URL)
  : 'http://localhost:8080';

const WS_ENDPOINT_NATIVE = '/notification-service/ws';
const WS_ENDPOINT_SOCKJS = '/notification-service/ws-sock';

export const useWebSocket = (destination?: string, userId?: string | number) => {
  const [isConnected, setIsConnected] = useState(false);
  // Payload shape is controlled by server events, so keep it flexible for now.
  const [notifications, setNotifications] = useState<any[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const { token } = useAuth();

  const { nativeUrl, sockUrl } = useMemo(() => {
    if (!userId || !destination || !token) {
      return { nativeUrl: null as string | null, sockUrl: null as string | null };
    }
    // Append JWT in query string for handshake (gateway will read access_token)
    const makeUrl = (endpoint: string) => {
      const url = `${GATEWAY_URL}${endpoint}`;
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}access_token=${encodeURIComponent(token)}`;
    };
    return {
      nativeUrl: makeUrl(WS_ENDPOINT_NATIVE),
      sockUrl: makeUrl(WS_ENDPOINT_SOCKJS),
    };
  }, [destination, userId, token]);

  useEffect(() => {
    if (!nativeUrl || !sockUrl || !destination || !token) {
      return;
    }

    // Prefer native WebSocket when available to ensure query params are preserved across transports.
    // Fallback to SockJS if native WS is not supported or fails at runtime.
    const canUseNativeWS = typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined';

    const triedFallbackRef = { current: false } as { current: boolean };
    const usingNativeRef = { current: canUseNativeWS } as { current: boolean };

    const createClient = (useNative: boolean) => {
      usingNativeRef.current = useNative;
      const client = new Client({
        reconnectDelay: 3000,
        ...(useNative
          ? { brokerURL: nativeUrl.replace(/^http(s?):\/\//, 'ws$1://') }
          : { webSocketFactory: () => new SockJS(sockUrl) }
        ),
        connectHeaders: { Authorization: `Bearer ${token}` },
      });

      client.onConnect = () => {
        setIsConnected(true);
        subscriptionRef.current = client.subscribe(destination, (frame: IMessage) => {
          try {
            const parsed = frame.body ? JSON.parse(frame.body) : null;
            if (parsed && typeof parsed === 'object') {
              setNotifications((prev) => [parsed, ...prev]);
            }
          } catch (err) {
            console.error('Failed to parse STOMP payload', err);
          }
        });
      };

      const tryFallback = () => {
        if (!triedFallbackRef.current && usingNativeRef.current) {
          triedFallbackRef.current = true;
          // Swap to SockJS
          client.deactivate().finally(() => {
            const sockClient = createClient(false);
            sockClient.activate();
            clientRef.current = sockClient;
          });
        }
      };

      client.onDisconnect = () => {
        setIsConnected(false);
      };

      client.onWebSocketClose = () => {
        if (!isConnected) {
          tryFallback();
        }
        setIsConnected(false);
      };

      client.onStompError = (frame: IFrame) => {
        console.error('STOMP error', frame.headers['message'], frame.body);
        if (!isConnected) {
          tryFallback();
        }
      };

      return client;
    };

    const initialClient = createClient(canUseNativeWS);
    initialClient.activate();
    clientRef.current = initialClient;

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [nativeUrl, sockUrl, destination]);

  const sendMessage = (message: Record<string, unknown>, overrideDestination?: string) => {
    if (!clientRef.current || !isConnected) {
      return;
    }

    const target = overrideDestination ?? destination;
    if (!target) {
      return;
    }

    try {
      clientRef.current.publish({
        destination: target,
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error('Failed to publish STOMP message', err);
    }
  };

  return { isConnected, notifications, sendMessage };
};
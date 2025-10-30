import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage, ChatConversation, User } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatWindow: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const topicDestination = user ? `/topic/user/${user.id}/chat` : undefined;
  const { notifications } = useWebSocket(topicDestination, user?.id);

  const otherParticipant = useMemo(
    () => conversation?.participants?.find((p) => p.id !== user?.id),
    [conversation, user?.id]
  );

  const normalizeRealtimeMessage = useCallback(
    (payload: any): ChatMessage | null => {
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      const rawId = typeof payload.id === 'string' ? payload.id : undefined;
      const conversationKey =
        typeof payload.conversationId === 'string' ? payload.conversationId : undefined;

      const senderIdRaw =
        typeof payload.senderId === 'number'
          ? payload.senderId
          : typeof payload.senderId === 'string'
          ? Number(payload.senderId)
          : undefined;

      const contentValue = typeof payload.content === 'string' ? payload.content : undefined;

      if (!rawId || !conversationKey || senderIdRaw == null || !contentValue) {
        return null;
      }

      let createdAtValue: string;
      if (typeof payload.createdAt === 'string') {
        createdAtValue = payload.createdAt;
      } else if (payload.createdAt && typeof payload.createdAt === 'object') {
        const dateParts = payload.createdAt as Record<string, number>;
        const year = dateParts.year;
        const month = dateParts.monthValue ?? dateParts.month;
        const day = dateParts.dayOfMonth ?? dateParts.day;
        const hour = dateParts.hour ?? 0;
        const minute = dateParts.minute ?? 0;
        const second = dateParts.second ?? 0;

        if (
          typeof year === 'number' &&
          typeof month === 'number' &&
          typeof day === 'number'
        ) {
          createdAtValue = new Date(Date.UTC(year, month - 1, day, hour, minute, second)).toISOString();
        } else {
          createdAtValue = new Date().toISOString();
        }
      } else {
        createdAtValue = new Date().toISOString();
      }

      const senderFromPayload =
        payload.sender && typeof payload.sender === 'object'
          ? (payload.sender as Partial<User>)
          : undefined;

      const resolvedSender: User = senderFromPayload
        ? {
            id: typeof senderFromPayload.id === 'number'
              ? senderFromPayload.id
              : typeof senderFromPayload.id === 'string'
              ? Number(senderFromPayload.id)
              : senderIdRaw,
            username:
              typeof senderFromPayload.username === 'string'
                ? senderFromPayload.username
                : `User ${senderIdRaw}`,
            email: senderFromPayload.email,
            profilePicture: senderFromPayload.profilePicture,
            bio: senderFromPayload.bio,
            followerCount: senderFromPayload.followerCount,
            followingCount: senderFromPayload.followingCount,
            postCount: senderFromPayload.postCount,
            createdAt: senderFromPayload.createdAt,
          }
        : senderIdRaw === user?.id && user
        ? user
        : otherParticipant && otherParticipant.id === senderIdRaw
        ? otherParticipant
        : {
            id: senderIdRaw,
            username:
              typeof payload.senderUsername === 'string'
                ? payload.senderUsername
                : `User ${senderIdRaw}`,
          };

      return {
        id: rawId,
        conversationId: conversationKey,
        senderId: senderIdRaw,
        content: contentValue,
        createdAt: createdAtValue,
        sender: resolvedSender,
      };
    },
    [user, otherParticipant]
  );

  useEffect(() => {
    if (conversationId && user) {
      loadConversationData();
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (!notifications.length || !conversationId) {
      return;
    }

    const latestPayload = notifications[0];
    const normalized = normalizeRealtimeMessage(latestPayload);

    if (!normalized || normalized.conversationId !== conversationId) {
      return;
    }

    setMessages((prev) => {
      if (prev.some((msg) => msg.id === normalized.id)) {
        return prev;
      }
      return [...prev, normalized];
    });
  }, [notifications, conversationId, normalizeRealtimeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationData = async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      // Load both conversation details and messages
      const [conversationData, messagesData] = await Promise.all([
        apiClient.getConversations(user.id),
        apiClient.getMessages(conversationId, user.id)
      ]);
      
      const matchedConversation = conversationData.find((conv) => conv.id === conversationId);
      if (matchedConversation) {
        setConversation(matchedConversation);
      }
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user || sending) return;
    
    // Check if conversation is active
    if (conversation?.status !== 'ACTIVE') {
      alert('You can only send messages in active conversations.');
      return;
    }

    setSending(true);
    try {
      await apiClient.sendMessage(user.id, conversationId, newMessage.trim());
      setNewMessage('');
      await loadConversationData(); // Reload to get the new message
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const isActive = conversation?.status === 'ACTIVE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <button
          type="button"
          aria-label="Back to messages"
          onClick={() => navigate('/messages')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        {otherParticipant && (
          <div className="flex items-center space-x-3 flex-1">
            {otherParticipant.profilePicture ? (
              <img
                src={otherParticipant.profilePicture}
                alt={otherParticipant.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {otherParticipant.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900">{otherParticipant.username}</h2>
              {!isActive && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pending approval
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning banner for non-active conversations */}
      {!isActive && (
        <div className="bg-amber-50 border-b border-amber-200 p-3">
          <p className="text-sm text-amber-800 text-center">
            This conversation is pending. You can send messages once it's accepted.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === user?.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id ? 'text-pink-100' : 'text-gray-500'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isActive ? "Type a message..." : "Wait for approval to send messages"}
            disabled={!isActive}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!newMessage.trim() || sending || !isActive}
            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage, ChatConversation } from '../../types';
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

  const { notifications } = useWebSocket(`/notification-service/ws/topic/user/${user?.id}/chat`, user?.id);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user) {
      return;
    }
    loadConversationDetails();
  }, [conversationId, user]);

  useEffect(() => {
    // Handle real-time messages
    const newChatMessage = notifications.find(n => n.type === 'message' && n.conversationId === conversationId);
    if (newChatMessage) {
      setMessages(prev => [...prev, newChatMessage]);
    }
  }, [notifications, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const messagesData = await apiClient.getMessages(conversationId);
      setMessages(messagesData);
      
      // Get conversation details from the first message or API
      if (messagesData.length > 0) {
        // You might need to call a separate API to get conversation details
        // For now, we'll construct it from the message data
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async () => {
    try {
      const conversations = await apiClient.getConversations();
      const matchedConversation = conversations.find((conv) => conv.id === conversationId);
      if (matchedConversation) {
        setConversation(matchedConversation);
      }
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user || sending) return;

    setSending(true);
    try {
      await apiClient.sendMessage({
        conversationId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages(); // Reload to get the new message
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const otherParticipant = conversation?.participants.find(p => p.id !== user?.id);

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
          <div className="flex items-center space-x-3">
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
            <h2 className="font-semibold text-gray-900">{otherParticipant.username}</h2>
          </div>
        )}
      </div>

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
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!newMessage.trim() || sending}
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
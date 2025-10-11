import React, { useState, useEffect } from 'react';
import { Check, X, MessageCircle } from 'lucide-react';
import { ChatConversation } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ChatRequestList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const requestsData = await apiClient.getPendingChatRequests(user.id);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load chat requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (conversationId: string) => {
    if (!user || processingId) return;

    try {
      setProcessingId(conversationId);
      await apiClient.acceptChatRequest(conversationId, user.id);
      // Remove from requests list
      setRequests(prev => prev.filter(req => req.id !== conversationId));
    } catch (error) {
      console.error('Failed to accept chat request:', error);
      alert('Failed to accept chat request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-600">You don't have any pending chat requests at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Chat Requests</h2>
        <p className="text-sm text-gray-600 mt-1">
          {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {requests.map((request) => {
          const requester = request.participants?.find(p => p.id === request.userA);
          if (!requester) return null;

          return (
            <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {requester.profilePicture ? (
                    <img
                      src={requester.profilePicture}
                      alt={requester.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {requester.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {requester.username}
                    </h3>
                    <p className="text-sm text-gray-600">
                      wants to chat with you
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    disabled={processingId === request.id}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatRequestList;

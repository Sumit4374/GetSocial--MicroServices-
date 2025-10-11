import React, { useState, useEffect } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { User, ChatConversation } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FollowingList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingChatWith, setRequestingChatWith] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const followingData = await apiClient.getFollowing(user.id);
      setFollowing(followingData);
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChat = async (otherUserId: number) => {
    if (!user || requestingChatWith) return;

    try {
      setRequestingChatWith(otherUserId);
      const conversation = await apiClient.requestChat(user.id, otherUserId) as ChatConversation;
      
      // If conversation is immediately active (both follow each other), navigate to it
      if (conversation.status === 'ACTIVE') {
        navigate(`/messages/${conversation.id}`);
      } else {
        alert('Chat request sent! You can start chatting once they accept.');
      }
    } catch (error: any) {
      console.error('Failed to request chat:', error);
      if (error.message?.includes('Already Exists')) {
        alert('A conversation with this user already exists.');
      } else {
        alert('Failed to send chat request. Please try again.');
      }
    } finally {
      setRequestingChatWith(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No following yet</h3>
        <p className="text-gray-600">Start following users to chat with them</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Following</h2>
        <p className="text-sm text-gray-600 mt-1">
          {following.length} {following.length === 1 ? 'person' : 'people'}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {following.map((person) => (
          <div key={person.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {person.profilePicture ? (
                  <img
                    src={person.profilePicture}
                    alt={person.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {person.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {person.username}
                  </h3>
                  {person.bio && (
                    <p className="text-sm text-gray-600 truncate">{person.bio}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleRequestChat(person.id)}
                disabled={requestingChatWith === person.id}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingList;

import React, { useState, useEffect } from 'react';
import { X, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { apiClient } from '../../utils/api';

interface FollowersListModalProps {
  userId: number;
  onClose: () => void;
}

const FollowersListModal: React.FC<FollowersListModalProps> = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async () => {
    try {
      const data = await apiClient.getFollowers(userId);
      setFollowers(data);
    } catch (error) {
      console.error('Failed to load followers:', error);
      setFollowers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    onClose();
    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Followers</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-12 px-6">
              <UserMinus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No followers yet</h3>
              <p className="text-gray-600">When someone follows this user, they'll appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {followers.map((follower) => (
                <button
                  key={follower.id}
                  onClick={() => handleUserClick(follower)}
                  className="w-full px-6 py-4 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {follower.profilePicture ? (
                      <img
                        src={follower.profilePicture}
                        alt={follower.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {follower.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{follower.username}</p>
                      {follower.bio && (
                        <p className="text-sm text-gray-500 truncate">{follower.bio}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersListModal;

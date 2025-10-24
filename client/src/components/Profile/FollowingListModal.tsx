import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { apiClient } from '../../utils/api';

interface FollowingListModalProps {
  userId: number;
  onClose: () => void;
}

const FollowingListModal: React.FC<FollowingListModalProps> = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    try {
      const data = await apiClient.getFollowing(userId);
      setFollowing(data);
    } catch (error) {
      console.error('Failed to load following:', error);
      setFollowing([]); // Set empty array on error
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
          <h2 className="text-xl font-bold text-gray-900">Following</h2>
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
          ) : following.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
              <p className="text-gray-600">When this user follows someone, they'll appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {following.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full px-6 py-4 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate">{user.bio}</p>
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

export default FollowingListModal;

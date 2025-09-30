import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid2x2 as Grid, Heart, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { User, Post } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../Post/PostCard';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserPosts();
      checkFollowingStatus();
    }
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      const userData = await apiClient.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!userId) return;

    try {
      const userPosts = await apiClient.getUserPosts(userId);
      setPosts(userPosts);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const checkFollowingStatus = async () => {
    if (!currentUser || !userId || currentUser.id === parseInt(userId)) return;

    try {
      const result = await apiClient.isFollowing(currentUser.id.toString(), userId);
      setIsFollowing(result.isFollowing);
    } catch (error) {
      console.error('Failed to check following status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !userId || currentUser.id === parseInt(userId)) return;

    try {
      if (isFollowing) {
        await apiClient.unfollowUser(currentUser.id.toString(), userId);
        setIsFollowing(false);
      } else {
        await apiClient.followUser(currentUser.id.toString(), userId);
        setIsFollowing(true);
      }
      // Reload profile to update follower count
      await loadUserProfile();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-pink-500 to-purple-600"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
                {user.username}
              </h1>
              
              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{user.postCount || 0}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{user.followerCount || 0}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-gray-900">{user.followingCount || 0}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Posts Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Posts Content */}
        <div className="p-6">
          {postsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">
                {isOwnProfile ? 'Share your first post!' : `${user.username} hasn't posted anything yet.`}
              </p>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-6'}>
              {view === 'grid' ? (
                posts.map((post) => {
                  const mediaUrl = post.mediaUrl || post.imageUrl;
                  const textContent = post.caption ?? post.content ?? '';
                  const isVideo = mediaUrl
                    ? /\.(mp4|m4v|mov|webm|ogg|mpe?g)$/i.test(mediaUrl.split('?')[0])
                    : false;

                  return (
                    <div key={post.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {mediaUrl ? (
                        isVideo ? (
                          <video
                            controls
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <p className="text-gray-600 text-center line-clamp-4">{textContent}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdate={loadUserPosts}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
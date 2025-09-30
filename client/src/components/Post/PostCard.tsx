import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import CommentModal from './CommentModal';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const mediaUrl = post.mediaUrl || post.imageUrl;
  const postText = post.caption ?? post.content ?? '';
  const isVideo = mediaUrl
    ? /\.(mp4|m4v|mov|webm|ogg|mpe?g)$/i.test(mediaUrl.split('?')[0])
    : false;
  const isCurrentUserPost = user?.id === post.userId;
  const authorName = post.user?.username ?? (isCurrentUserPost ? user?.username : `User ${post.userId}`) ?? 'Unknown User';
  const authorProfilePicture = post.user?.profilePicture ?? (isCurrentUserPost ? user?.profilePicture : undefined);
  const createdAtLabel = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : 'Just now';

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        await apiClient.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await apiClient.likePost(post.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GetSocial Post',
          text: postText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {authorProfilePicture ? (
            <img
              src={authorProfilePicture}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{authorName}</h3>
            <p className="text-sm text-gray-500">{createdAtLabel}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Post actions"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Image */}
      {mediaUrl && (
        <div className="aspect-square">
          {isVideo ? (
            <video
              controls
              src={mediaUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Post content"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Content */}
      {postText && (
        <div className="p-4">
          <p className="text-gray-900 leading-relaxed">{postText}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              aria-label="View comments"
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Share post"
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1">
          {likeCount > 0 && (
            <p className="font-semibold text-gray-900">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </p>
          )}
          {(post.commentCount ?? 0) > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              View all {post.commentCount} comments
            </button>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showComments && (
        <CommentModal
          post={post}
          onClose={() => setShowComments(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default PostCard;
import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, Comment, User } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface CommentModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ post, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const postText = post.caption ?? post.content ?? '';
  const isCurrentUserPost = user?.id === post.userId;
  const authorName = post.user?.username ?? (isCurrentUserPost ? user?.username : `User ${post.userId}`) ?? 'Unknown User';
  const authorProfilePicture = post.user?.profilePicture ?? (isCurrentUserPost ? user?.profilePicture : undefined);
  const createdAtLabel = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : 'Just now';

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    try {
      const commentsData = await apiClient.getComments(post.id);

      const commentsNeedingUsers = commentsData.filter((comment) => !comment.user);
      const uniqueUserIds = Array.from(
        new Set(
          commentsNeedingUsers
            .map((comment) => comment.userId)
            .filter((id): id is number => typeof id === 'number')
        )
      );

      let userMap = new Map<number, User>();

      if (uniqueUserIds.length > 0) {
        const userResponses = await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userDetails = await apiClient.getUserBasic(String(userId));
              return [userId, userDetails] as const;
            } catch (error) {
              console.error(`Failed to fetch user details for userId ${userId}:`, error);
              return null;
            }
          })
        );

        userMap = new Map(userResponses.filter((entry): entry is [number, User] => entry !== null));
      }

      const enrichedComments = commentsData.map((comment) => {
        if (comment.user || typeof comment.userId !== 'number') {
          return comment;
        }

        const userDetails = userMap.get(comment.userId);
        if (!userDetails) {
          return comment;
        }

        return {
          ...comment,
          user: userDetails,
        };
      });

      setComments(enrichedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
  await apiClient.addComment(post.id, user.id, newComment.trim());
      setNewComment('');
      await loadComments();
      onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
          <button
            type="button"
            aria-label="Close comments"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            {authorProfilePicture ? (
              <img
                src={authorProfilePicture}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{authorName}</h3>
              <p className="text-sm text-gray-500">{createdAtLabel}</p>
            </div>
          </div>
          {postText && (
            <p className="text-gray-900 text-sm leading-relaxed">{postText}</p>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No comments yet</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isCurrentUser = comment.userId === user?.id;
                const commenterName =
                  comment.user?.username ?? (isCurrentUser ? user?.username : `User ${comment.userId}`) ?? 'Unknown User';
                const commenterProfilePicture =
                  comment.user?.profilePicture ?? (isCurrentUser ? user?.profilePicture : undefined);
                const commentText = comment.content ?? comment.comment ?? '';
                const createdAtLabel = comment.createdAt
                  ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                  : 'Just now';

                return (
                  <div key={comment.id} className="flex space-x-3">
                    {commenterProfilePicture ? (
                      <img
                        src={commenterProfilePicture}
                        alt={commenterName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {commenterName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {commenterName}
                      </h4>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {commentText}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {createdAtLabel}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                aria-label="Send comment"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Send comment</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;
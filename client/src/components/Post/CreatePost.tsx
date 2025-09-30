import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Send, X } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    if (!file) {
      setMediaFile(null);
      setMediaPreview(null);
      setPreviewType(null);
      return;
    }

    setMediaFile(file);

    if (file.type.startsWith('image/')) {
      setPreviewType('image');
      setMediaPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setPreviewType('video');
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setPreviewType(null);
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setPreviewType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    if (!mediaFile || !user || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const caption = content.trim();
      formData.append('caption', caption);
      formData.append('file', mediaFile);

      if (!user) {
        throw new Error('User context not available');
      }

      await apiClient.createPost(formData, user.id);

      setContent('');
      clearMedia();
      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              aria-label="Go back"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
          </div>
          <button
            onClick={() => handleSubmit()}
            disabled={!mediaFile || !user || isSubmitting}
            className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-6">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{user?.username}</h3>
              <p className="text-sm text-gray-500">Share your thoughts</p>
            </div>
          </div>

          {/* Content Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={6}
          />

          {/* Media Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (image or video)
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 hover:text-pink-500 transition-colors">
                <ImageIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Upload media</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {mediaFile && (
                <button
                  type="button"
                  onClick={clearMedia}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            {mediaFile && (
              <p className="mt-2 text-sm text-gray-600">{mediaFile.name}</p>
            )}
          </div>

          {/* Media Preview */}
          {mediaPreview && previewType === 'image' && (
            <div className="mt-4">
              <img
                src={mediaPreview}
                alt="Selected media preview"
                className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {mediaPreview && previewType === 'video' && (
            <div className="mt-4">
              <video
                controls
                src={mediaPreview}
                className="w-full max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
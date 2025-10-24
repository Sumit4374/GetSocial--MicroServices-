import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      loadNotifications();
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await apiClient.getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiClient.getUnreadNotifications(user.id);
      setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await apiClient.markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowDropdown(false);
      
      // Navigate based on notification type
      if (notification.type === 'FOLLOW') {
        navigate(`/profile/${notification.senderId}`);
      } else if (notification.postId) {
        navigate(`/`); // Navigate to home and find the post
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/activity');
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-600 hover:text-pink-500 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No new notifications
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.senderProfilePicture ? (
                        <img 
                          src={notification.senderProfilePicture} 
                          alt={notification.senderUsername || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {notification.senderUsername?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleViewAll}
                className="w-full px-4 py-2 text-sm text-pink-500 hover:bg-gray-50 font-medium"
              >
                View all notifications
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

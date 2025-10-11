import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import ChatList from '../components/Chat/ChatList';
import ChatRequestList from '../components/Chat/ChatRequestList';
import FollowingList from '../components/Chat/FollowingList';
import { MessageCircle, Users, Inbox } from 'lucide-react';

type TabType = 'chats' | 'following' | 'requests';

const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chats');

  const tabs = [
    { id: 'chats' as TabType, label: 'Active Chats', icon: MessageCircle },
    { id: 'following' as TabType, label: 'Following', icon: Users },
    { id: 'requests' as TabType, label: 'Requests', icon: Inbox },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'chats' && <ChatList />}
          {activeTab === 'following' && <FollowingList />}
          {activeTab === 'requests' && <ChatRequestList />}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
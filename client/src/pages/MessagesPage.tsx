import React from 'react';
import Layout from '../components/Layout/Layout';
import ChatList from '../components/Chat/ChatList';

const MessagesPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ChatList />
      </div>
    </Layout>
  );
};

export default MessagesPage;
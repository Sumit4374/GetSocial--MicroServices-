import React from 'react';
import Layout from '../components/Layout/Layout';
import ChatWindow from '../components/Chat/ChatWindow';

const ChatPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <ChatWindow />
      </div>
    </Layout>
  );
};

export default ChatPage;
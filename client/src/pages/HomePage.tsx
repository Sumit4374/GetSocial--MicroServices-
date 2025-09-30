import React from 'react';
import Layout from '../components/Layout/Layout';
import Feed from '../components/Feed/Feed';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
          <p className="text-gray-600">Discover what your friends are sharing</p>
        </div>
        <Feed />
      </div>
    </Layout>
  );
};

export default HomePage;
import React from 'react';
import Layout from '../components/Layout/Layout';
import UserProfile from '../components/Profile/UserProfile';

const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <UserProfile />
    </Layout>
  );
};

export default ProfilePage;
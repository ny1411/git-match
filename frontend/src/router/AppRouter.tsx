import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import page components
import LandingPage from '../pages/Landing';

// --- Placeholder Components
const Login = () => <div className="p-10 text-white">Login Page</div>;
const Onboarding = () => <div className="p-10 text-white">Onboarding Page</div>;
const Dashboard = () => <div className="p-10 text-white">Dashboard Page</div>;
const Profile = () => <div className="p-10 text-white">Profile Page</div>;
const Matches = () => <div className="p-10 text-white">Matches Page</div>;
const Chat = () => <div className="p-10 text-white">Chat Page</div>;    

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Landing page is the default route */}
      <Route path="/" element={<LandingPage />} />

      {/* Other routes from your structure */}
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/chat" element={<Chat />} />
      
      {/* Add a fallback/404 route */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRouter;
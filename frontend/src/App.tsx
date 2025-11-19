import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GalaxyPage from './pages/GalaxyPage';
import CreatePage from './pages/CreatePage';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import ParticleDemo from './pages/ParticleDemo';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/galaxy"
            element={
              <Layout>
                <GalaxyPage />
              </Layout>
            }
          />
          <Route
            path="/create"
            element={
              <Layout>
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/chat/:creatureId"
            element={
              <Layout>
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/conversations"
            element={
              <Layout>
                <ProtectedRoute>
                  <ConversationsPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/particle-demo"
            element={
              <Layout>
                <ParticleDemo />
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

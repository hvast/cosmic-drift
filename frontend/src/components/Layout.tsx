import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cosmic-dark">
      <nav className="border-b border-gray-800 bg-cosmic-dark/80 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-purple to-cosmic-pink bg-clip-text text-transparent">
              Cosmic Drift
            </h1>
            <div className="flex gap-6">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">
                首页
              </a>
              <a href="/galaxy" className="text-gray-300 hover:text-white transition-colors">
                星图
              </a>
              <a href="/create" className="text-gray-300 hover:text-white transition-colors">
                创建
              </a>
              <a href="/conversations" className="text-gray-300 hover:text-white transition-colors">
                对话
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;

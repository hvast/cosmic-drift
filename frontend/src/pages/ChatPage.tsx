import React from 'react';
import { useParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { creatureId } = useParams<{ creatureId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">对话</h2>
      <p className="text-gray-400">Chat interface for creature {creatureId} will be implemented here</p>
    </div>
  );
};

export default ChatPage;

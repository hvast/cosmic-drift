import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GalaxyScene from '../components/GalaxyScene';
import ProfileCardOverlay from '../components/ProfileCardOverlay';
import RandomEncounter from '../components/RandomEncounter';
import { CreatureProfile } from '../types/creature';
import creatureService from '../services/creatureService';

const GalaxyPage: React.FC = () => {
  const navigate = useNavigate();
  const [creatures, setCreatures] = useState<CreatureProfile[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<CreatureProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCreatures, setTotalCreatures] = useState(0);

  useEffect(() => {
    loadCreatures();
  }, []);

  const loadCreatures = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      // Load more creatures per page for better galaxy visualization
      const response = await creatureService.getCreatures(pageNum, 200);
      
      if (append) {
        setCreatures((prev) => [...prev, ...response.creatures]);
      } else {
        setCreatures(response.creatures);
      }
      
      setTotalCreatures(response.total);
      setPage(pageNum);
      setHasMore(response.creatures.length === 200 && creatures.length + response.creatures.length < response.total);
    } catch (err) {
      console.error('Failed to load creatures:', err);
      setError('无法加载生物数据');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCreatures = () => {
    if (!loading && hasMore) {
      loadCreatures(page + 1, true);
    }
  };

  const handleCreatureClick = (creature: CreatureProfile) => {
    setSelectedCreature(creature);
  };

  const handleCloseProfile = () => {
    setSelectedCreature(null);
  };

  const handleStartChat = (creatureId: string) => {
    navigate(`/chat/${creatureId}`);
  };

  const handleRandomEncounter = (creature: CreatureProfile) => {
    setSelectedCreature(creature);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white">星际漂流</h2>
          <p className="text-gray-400 text-sm mt-1">
            探索宇宙中漂流的数字生命 · 已加载 {creatures.length} / {totalCreatures}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            💡 拖动旋转视角 · Ctrl+滚轮缩放 · 点击生物查看详情
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {hasMore && !loading && (
            <button
              onClick={loadMoreCreatures}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              加载更多
            </button>
          )}
          <RandomEncounter onEncounter={handleRandomEncounter} />
        </div>
      </div>
      <div className="flex-1 relative">
        {loading && creatures.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <div className="text-white text-lg">加载星际生命中...</div>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-4">{error}</div>
              <button
                onClick={() => loadCreatures()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        ) : (
          <>
            <GalaxyScene
              className="absolute inset-0"
              creatures={creatures}
              onCreatureClick={handleCreatureClick}
            />
            
            {/* Loading indicator for lazy loading */}
            {loading && creatures.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 px-4 py-2 rounded-full">
                <span className="text-white text-sm">加载更多生命...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Card Overlay */}
      {selectedCreature && (
        <ProfileCardOverlay
          creature={selectedCreature}
          onClose={handleCloseProfile}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default GalaxyPage;

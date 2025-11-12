import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreatureProfile } from '../types/creature';

interface ProfileEditorProps {
  profile: CreatureProfile;
  onUpdate: (updates: { name?: string; backstory?: string }) => void;
  onPublish: () => void;
  isLoading?: boolean;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onUpdate,
  onPublish,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedBackstory, setEditedBackstory] = useState(profile.backstory);

  const handleSave = () => {
    const updates: { name?: string; backstory?: string } = {};
    
    if (editedName !== profile.name) {
      updates.name = editedName;
    }
    
    if (editedBackstory !== profile.backstory) {
      updates.backstory = editedBackstory;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(profile.name);
    setEditedBackstory(profile.backstory);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
        <h2 className="text-3xl font-bold text-white text-center">
          生物档案
        </h2>
      </div>

      <div className="p-8 space-y-6">
        {/* Image Display */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-purple-500/50"
          >
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="max-w-md max-h-96 object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Name Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">名称</label>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={50}
            />
          ) : (
            <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
          )}
        </div>

        {/* Species */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">物种</label>
          <p className="text-lg text-white">{profile.species}</p>
        </div>

        {/* Personality */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">性格特征</label>
          <div className="flex flex-wrap gap-2">
            {profile.personality.map((trait, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full text-white text-sm"
              >
                {trait}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Habitat */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">栖息地</label>
          <p className="text-white leading-relaxed">{profile.habitat}</p>
        </div>

        {/* Backstory */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">背景故事</label>
          {isEditing ? (
            <textarea
              value={editedBackstory}
              onChange={(e) => setEditedBackstory(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
              maxLength={1000}
            />
          ) : (
            <p className="text-white leading-relaxed whitespace-pre-wrap">
              {profile.backstory}
            </p>
          )}
        </div>

        {/* Emotion Value */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-300">情绪值</label>
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden border border-purple-500/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.emotionValue}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
            <span className="text-white font-medium">{profile.emotionValue}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '保存中...' : '保存修改'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all"
              >
                编辑档案
              </button>
              <button
                onClick={onPublish}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
              >
                {isLoading ? '发布中...' : '发布到宇宙'}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileEditor;

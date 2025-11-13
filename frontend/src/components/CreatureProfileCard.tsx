import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreatureProfile } from '../types/creature';

interface CreatureProfileCardProps {
  profile: CreatureProfile;
  onUpdate: (updates: Partial<CreatureProfile>) => void;
  onPublish: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

// 预设的物种和栖息地选项（从 localStorage 获取用户创建的）
const getStoredOptions = (key: string): string[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const saveOption = (key: string, value: string) => {
  const options = getStoredOptions(key);
  if (!options.includes(value) && value.trim()) {
    options.push(value.trim());
    localStorage.setItem(key, JSON.stringify(options));
  }
};

const CreatureProfileCard: React.FC<CreatureProfileCardProps> = ({
  profile,
  onUpdate,
  onPublish,
  isLoading = false,
  isEditing: initialEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    species: profile.species || '',
    personality: profile.personality || [],
    habitat: profile.habitat || '',
    backstory: profile.backstory || '',
  });
  const [emotionValue, setEmotionValue] = useState(profile.emotionValue || 50);

  const [speciesOptions, setSpeciesOptions] = useState<string[]>(getStoredOptions('creature_species'));
  const [habitatOptions, setHabitatOptions] = useState<string[]>(getStoredOptions('creature_habitats'));
  const [newPersonalityTrait, setNewPersonalityTrait] = useState('');
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setIsEditing(initialEditing);
  }, [initialEditing]);

  // 随机生成名称
  const generateRandomName = () => {
    const prefixes = ['星', '月', '云', '光', '影', '梦', '幻', '灵', '晨', '夜', '霜', '雪', '风', '雨'];
    const middles = ['之', '的', '与'];
    const suffixes = ['灵', '者', '精', '魂', '使', '子', '影', '光', '歌', '舞', '语', '梦'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    setFormData({ ...formData, name: `${prefix}${middle}${suffix}` });
  };

  const handleSave = () => {
    // 验证必填字段
    setValidationError('');
    
    if (!formData.name || formData.name.trim().length === 0) {
      setValidationError('请输入生物名称');
      return;
    }
    
    if (!formData.species || formData.species.trim().length === 0) {
      setValidationError('请输入或选择物种');
      return;
    }
    
    if (!formData.habitat || formData.habitat.trim().length === 0) {
      setValidationError('请输入或选择栖息地');
      return;
    }
    
    // 背景故事可以为空，不再验证

    // 保存新的物种和栖息地到本地存储
    if (formData.species) saveOption('creature_species', formData.species);
    if (formData.habitat) saveOption('creature_habitats', formData.habitat);

    onUpdate({
      name: formData.name,
      species: formData.species,
      personality: formData.personality,
      habitat: formData.habitat,
      backstory: formData.backstory,
      emotionValue: emotionValue,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      species: profile.species || '',
      personality: profile.personality || [],
      habitat: profile.habitat || '',
      backstory: profile.backstory || '',
    });
    setEmotionValue(profile.emotionValue || 50);
    setValidationError('');
    setIsEditing(false);
  };

  const addPersonalityTrait = () => {
    if (newPersonalityTrait.trim() && formData.personality.length < 6) {
      setFormData({
        ...formData,
        personality: [...formData.personality, newPersonalityTrait.trim()],
      });
      setNewPersonalityTrait('');
    }
  };

  const removePersonalityTrait = (index: number) => {
    setFormData({
      ...formData,
      personality: formData.personality.filter((_, i) => i !== index),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Sci-Fi Card Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-purple-950/50 to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-400" />

        {/* Content */}
        <div className="relative p-8 md:p-12">
          {/* Validation Error */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 font-mono text-sm"
            >
              ⚠️ {validationError}
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/30">
            <div>
              <h2 className="text-3xl font-bold text-cyan-400 tracking-wider font-mono">
                生物档案 CREATURE PROFILE
              </h2>
              <p className="text-cyan-600 text-sm mt-1 font-mono">
                档案编号 ID: {profile.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 text-sm font-mono">状态 STATUS</div>
              <div className="text-green-400 text-lg font-bold font-mono">活跃 ACTIVE</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Image */}
            <div className="md:col-span-1">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30" />
                <div className="relative bg-black rounded-lg overflow-hidden border border-cyan-500/50">
                  <img
                    src={profile.imageUrl}
                    alt={formData.name || 'Creature'}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="text-cyan-400 text-xs font-mono">证件照 PHOTO ID</div>
                  </div>
                </div>
              </div>

              {/* Emotion Value */}
              <div className="mt-6 p-4 bg-black/50 rounded-lg border border-cyan-500/30">
                <div className="text-cyan-400 text-sm font-mono mb-2">情绪值 EMOTION</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={emotionValue}
                      onChange={(e) => setEmotionValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-cyan-600 font-mono">
                      <span>0</span>
                      <span className="text-cyan-400 font-bold text-lg">{emotionValue}</span>
                      <span>100</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${emotionValue}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      />
                    </div>
                    <span className="text-cyan-400 font-mono font-bold">{emotionValue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Information */}
            <div className="md:col-span-2 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-mono uppercase tracking-wider">名称 NAME</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/50 rounded text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="输入生物名称..."
                      maxLength={50}
                    />
                    <button
                      onClick={generateRandomName}
                      className="px-4 py-3 bg-purple-600/20 border border-purple-500/50 rounded text-purple-400 hover:bg-purple-600/30 transition-colors font-mono"
                      title="随机生成名称"
                    >
                      🎲
                    </button>
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-white font-mono tracking-wide">
                    {formData.name || '未命名生物'}
                  </h3>
                )}
              </div>

              {/* Species */}
              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-mono uppercase tracking-wider">物种 SPECIES</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      list="species-options"
                      value={formData.species}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                      className="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/50 rounded text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="选择或输入新物种..."
                      maxLength={50}
                    />
                    <datalist id="species-options">
                      {speciesOptions.map((option, i) => (
                        <option key={i} value={option} />
                      ))}
                    </datalist>
                  </div>
                ) : (
                  <p className="text-xl text-white font-mono">{formData.species || '未知物种'}</p>
                )}
              </div>

              {/* Personality */}
              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-mono uppercase tracking-wider">性格特征 PERSONALITY</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.personality.map((trait, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-300 text-sm font-mono flex items-center gap-2"
                        >
                          {trait}
                          <button
                            onClick={() => removePersonalityTrait(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    {formData.personality.length < 6 && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPersonalityTrait}
                          onChange={(e) => setNewPersonalityTrait(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addPersonalityTrait()}
                          className="flex-1 px-4 py-2 bg-black/50 border border-cyan-500/50 rounded text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                          placeholder="添加性格特征..."
                          maxLength={20}
                        />
                        <button
                          onClick={addPersonalityTrait}
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 hover:bg-cyan-500/30 transition-colors font-mono text-sm"
                        >
                          添加
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.personality.length > 0 ? (
                      formData.personality.map((trait, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-300 text-sm font-mono"
                        >
                          {trait}
                        </motion.span>
                      ))
                    ) : (
                      <span className="text-gray-500 font-mono text-sm">无性格特征</span>
                    )}
                  </div>
                )}
              </div>

              {/* Habitat */}
              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-mono uppercase tracking-wider">栖息地 HABITAT</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      list="habitat-options"
                      value={formData.habitat}
                      onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                      className="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/50 rounded text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="选择或输入新栖息地..."
                      maxLength={200}
                    />
                    <datalist id="habitat-options">
                      {habitatOptions.map((option, i) => (
                        <option key={i} value={option} />
                      ))}
                    </datalist>
                  </div>
                ) : (
                  <p className="text-white leading-relaxed font-mono text-sm">
                    {formData.habitat || '未知栖息地'}
                  </p>
                )}
              </div>

              {/* Backstory */}
              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-mono uppercase tracking-wider">背景故事 BACKSTORY</label>
                {isEditing ? (
                  <textarea
                    value={formData.backstory}
                    onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-cyan-500/50 rounded text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors min-h-[120px] resize-none"
                    placeholder="讲述这个生命的故事..."
                    maxLength={1000}
                  />
                ) : (
                  <p className="text-white leading-relaxed font-mono text-sm whitespace-pre-wrap">
                    {formData.backstory || '这个生命的故事尚未被书写...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-cyan-500/30 flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded font-mono uppercase tracking-wider hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 border border-green-400/50"
                >
                  {isLoading ? '保存中...' : '保存 SAVE'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded font-mono uppercase tracking-wider hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-600"
                >
                  取消 CANCEL
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 bg-cyan-600/20 text-cyan-400 rounded font-mono uppercase tracking-wider hover:bg-cyan-600/30 transition-all border border-cyan-500/50"
                >
                  编辑档案 EDIT
                </button>
                <button
                  onClick={onPublish}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-mono uppercase tracking-wider hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 border border-purple-400/50 shadow-lg shadow-purple-500/30"
                >
                  {isLoading ? '发布中...' : '发布到宇宙 PUBLISH'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatureProfileCard;

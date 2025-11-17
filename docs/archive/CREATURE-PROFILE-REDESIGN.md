# 🎨 生物档案重新设计

## 设计灵感

参考你提供的科幻风格简历，采用赛博朋克/科幻风格设计。

## 核心改进

### 1. 科幻风格布局

**布局结构：**
```
┌─────────────────────────────────────────┐
│  CREATURE PROFILE      STATUS: ACTIVE   │
│  ID: XXXXXXXX                           │
├─────────────┬───────────────────────────┤
│             │                           │
│   [图片]    │  Name: [名称]             │
│             │  Species: [物种]          │
│   情绪值    │  Personality: [特征]      │
│             │  Habitat: [栖息地]        │
│             │  Backstory: [背景故事]    │
│             │                           │
└─────────────┴───────────────────────────┘
│         [EDIT] [PUBLISH]                │
└─────────────────────────────────────────┘
```

**视觉特点：**
- 黑色背景 + 青色边框
- 网格背景纹理
- 四角装饰线
- Monospace 字体（科幻感）
- 渐变光效
- 扫描线效果

### 2. 可编辑所有字段

**现在可以编辑：**
- ✅ 名称 (Name)
- ✅ 物种 (Species) - 下拉框 + 自定义
- ✅ 性格特征 (Personality) - 标签形式，可添加/删除
- ✅ 栖息地 (Habitat) - 下拉框 + 自定义
- ✅ 背景故事 (Backstory) - 文本域

### 3. 物种和栖息地系统

**功能特点：**
- 使用 HTML5 `<datalist>` 实现下拉框 + 自定义输入
- 数据存储在 `localStorage`
- 用户创建的新类别会自动保存
- 其他用户可以选择已有类别

**存储键：**
- `creature_species` - 物种列表
- `creature_habitats` - 栖息地列表

**工作流程：**
1. 用户输入新物种/栖息地
2. 保存时自动添加到选项列表
3. 下次创建时可以从列表选择
4. 支持模糊搜索

### 4. 性格特征系统

**交互方式：**
- 显示为标签（Tag）形式
- 编辑模式下可以删除（点击 × 按钮）
- 输入框添加新特征
- 按 Enter 或点击"添加"按钮
- 最多 6 个特征

### 5. 自动保存新类别

```typescript
const saveOption = (key: string, value: string) => {
  const options = getStoredOptions(key);
  if (!options.includes(value) && value.trim()) {
    options.push(value.trim());
    localStorage.setItem(key, JSON.stringify(options));
  }
};
```

## 技术实现

### 组件结构

```
CreatureProfileCard
├── 背景层（网格 + 渐变）
├── 装饰层（四角边框）
├── 内容层
│   ├── Header（标题 + 状态）
│   ├── Grid 布局
│   │   ├── 左侧：图片 + 情绪值
│   │   └── 右侧：所有字段
│   └── 操作按钮
```

### 状态管理

```typescript
const [formData, setFormData] = useState({
  name: profile.name || '',
  species: profile.species || '',
  personality: profile.personality || [],
  habitat: profile.habitat || '',
  backstory: profile.backstory || '',
});
```

### 下拉框实现

使用 HTML5 原生 `<datalist>` 元素：

```tsx
<input
  list="species-options"
  value={formData.species}
  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
/>
<datalist id="species-options">
  {speciesOptions.map((option, i) => (
    <option key={i} value={option} />
  ))}
</datalist>
```

**优点：**
- 原生支持，无需额外库
- 支持自定义输入
- 支持模糊搜索
- 轻量级

## 视觉设计细节

### 颜色方案
- 主色：Cyan (#00FFFF)
- 辅色：Purple (#A855F7)
- 背景：Black (#000000)
- 文字：White (#FFFFFF)
- 边框：Cyan 50% opacity

### 字体
- 主字体：Monospace (font-mono)
- 标题：大写 + 字母间距
- 正文：小号 monospace

### 动画效果
- 进入动画：scale + opacity
- 情绪值：宽度动画
- 标签：stagger 动画
- 按钮：hover 效果

### 边框装饰
```
┌─────  四角装饰线
│
│  32x32 像素
│  2px 边框
│  Cyan 颜色
```

## 未来扩展

### 1. 相似生物推荐

基于物种和栖息地，在星系中将相似生物放在相近位置：

```typescript
// 计算相似度
const calculateSimilarity = (creature1, creature2) => {
  let score = 0;
  if (creature1.species === creature2.species) score += 50;
  if (creature1.habitat === creature2.habitat) score += 30;
  // 性格特征重叠
  const commonTraits = creature1.personality.filter(t => 
    creature2.personality.includes(t)
  );
  score += commonTraits.length * 5;
  return score;
};
```

### 2. 物种/栖息地统计

显示每个类别的生物数量：

```typescript
// 在选择框中显示
"星云深处 (23个生物)"
"暗影区域 (15个生物)"
```

### 3. 热门标签

显示最常用的物种和栖息地：

```typescript
const getPopularOptions = (key: string) => {
  // 从后端获取使用频率
  // 按频率排序
  // 显示 Top 10
};
```

### 4. 标签颜色编码

根据类别自动分配颜色：

```typescript
const getTagColor = (category: string) => {
  const hash = category.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
```

### 5. 导出/分享功能

生成精美的分享卡片：

```typescript
const exportAsImage = async () => {
  // 使用 html2canvas 或 dom-to-image
  // 生成 PNG 图片
  // 下载或分享到社交媒体
};
```

## 测试步骤

### 1. 测试自己编写模式

1. 绘制图片 → 提交证件照
2. 点击"自己编写"
3. 应该看到新的科幻风格档案卡片
4. 所有字段都可以编辑
5. 测试添加物种：输入"星云游者"
6. 测试添加栖息地：输入"星云深处"
7. 测试添加性格特征：输入"神秘"、"温柔"
8. 点击保存

### 2. 测试下拉框功能

1. 创建第二个生物
2. 在物种输入框中，应该能看到之前输入的"星云游者"
3. 在栖息地输入框中，应该能看到"星云深处"
4. 可以选择已有选项，也可以输入新的

### 3. 测试 AI 生成模式

1. 绘制图片 → 提交证件照
2. 点击"AI 生成"
3. 等待生成完成
4. 点击"EDIT PROFILE"
5. 修改任意字段
6. 点击"SAVE"

### 4. 测试性格特征

1. 进入编辑模式
2. 添加多个性格特征
3. 删除某个特征（点击 × 按钮）
4. 尝试添加第 7 个特征（应该被限制）

## 样式预览

### 卡片外观
```
╔═══════════════════════════════════════╗
║  CREATURE PROFILE    STATUS: ACTIVE   ║
║  ID: A1B2C3D4                         ║
╠═══════════╦═══════════════════════════╣
║           ║                           ║
║  [IMAGE]  ║  Name: 星辰漫步者          ║
║           ║  Species: 星云游者         ║
║  ▓▓▓▓░░   ║  Personality:             ║
║  50       ║  [神秘] [温柔] [智慧]      ║
║           ║  Habitat: 星云深处...      ║
║           ║  Backstory: 这是一个...    ║
╚═══════════╩═══════════════════════════╝
║      [EDIT]        [PUBLISH]          ║
╚═══════════════════════════════════════╝
```

## 文件位置

- **新组件**：`frontend/src/components/CreatureProfileCard.tsx`
- **修改文件**：`frontend/src/pages/CreatePage.tsx`
- **存储位置**：`localStorage`
  - `creature_species`
  - `creature_habitats`

## 注意事项

### LocalStorage 限制
- 大小限制：约 5-10MB
- 仅客户端存储
- 清除浏览器数据会丢失

### 未来改进
建议将物种和栖息地数据迁移到后端：
- 创建 `species` 和 `habitats` 表
- 记录使用频率
- 支持全局共享
- 支持搜索和过滤

祝测试顺利！🚀

# 需求文档

## 简介

生物图鉴功能允许用户以卡片式网格布局浏览所有已创建的生物，查看生物详情，并对喜欢的生物进行点赞。该功能为用户提供了一个集中的地方来探索和欣赏社区创建的所有生物。

## 术语表

- **Gallery System（图鉴系统）**: 展示所有生物的卡片式浏览界面
- **Creature Card（生物卡片）**: 在图鉴中显示单个生物基本信息的卡片组件
- **Like System（点赞系统）**: 允许用户对生物表达喜爱的功能
- **Detail View（详情视图）**: 显示生物完整信息的页面或弹窗
- **User（用户）**: 浏览图鉴和与生物互动的人
- **Backend API（后端API）**: 处理点赞数据存储和检索的服务器端点

## 需求

### 需求 1：图鉴页面展示

**用户故事：** 作为用户，我想要看到一个展示所有生物的图鉴页面，以便我可以浏览社区创建的所有生物。

#### 验收标准

1. THE Gallery System SHALL display all creatures in a responsive grid layout with cards
2. WHEN a user navigates to the gallery page, THE Gallery System SHALL load and display creatures with pagination support
3. THE Creature Card SHALL display the creature's image, name, species, and like count
4. WHILE loading creature data, THE Gallery System SHALL display a loading indicator
5. IF the creature list is empty, THEN THE Gallery System SHALL display a friendly empty state message

### 需求 2：生物详情查看

**用户故事：** 作为用户，我想要点击生物卡片查看详细信息，以便我可以了解生物的完整背景故事和属性。

#### 验收标准

1. WHEN a user clicks on a creature card, THE Gallery System SHALL navigate to the creature detail view or open a detail modal
2. THE Detail View SHALL display all creature information including name, species, personality traits, habitat, backstory, emotion value, and creation date
3. THE Detail View SHALL display the creature's full-size image
4. THE Detail View SHALL provide a way to return to the gallery view
5. WHILE loading creature details, THE Detail View SHALL display a loading indicator

### 需求 3：点赞功能

**用户故事：** 作为用户，我想要对喜欢的生物点赞，以便我可以表达对该生物的喜爱并让创作者知道。

#### 验收标准

1. THE Creature Card SHALL display a like button with the current like count
2. WHEN a user clicks the like button, THE Like System SHALL increment the like count by one
3. WHEN a user clicks the like button on an already-liked creature, THE Like System SHALL decrement the like count by one
4. THE Like System SHALL visually indicate whether the current user has liked a creature
5. THE Backend API SHALL persist like data to the database
6. THE Backend API SHALL return the updated like count after a like or unlike action

### 需求 4：点赞数据持久化

**用户故事：** 作为系统管理员，我需要点赞数据被正确存储和检索，以便用户的点赞状态在刷新页面后保持一致。

#### 验收标准

1. THE Backend API SHALL store like count for each creature in the database
2. THE Backend API SHALL track which users have liked which creatures
3. WHEN a creature is retrieved, THE Backend API SHALL include the total like count
4. WHERE user authentication is available, THE Backend API SHALL include whether the current user has liked the creature
5. THE Backend API SHALL prevent duplicate likes from the same user for the same creature

### 需求 5：图鉴筛选和排序

**用户故事：** 作为用户，我想要能够按不同方式排序生物，以便我可以找到最受欢迎或最新创建的生物。

#### 验收标准

1. THE Gallery System SHALL provide sorting options including "最新创建", "最多点赞", and "随机"
2. WHEN a user selects a sort option, THE Gallery System SHALL reorder the creature cards accordingly
3. THE Gallery System SHALL maintain the selected sort option when navigating between pages
4. THE Gallery System SHALL display the currently active sort option
5. WHILE resorting creatures, THE Gallery System SHALL provide visual feedback

### 需求 6：响应式设计

**用户故事：** 作为移动设备用户，我想要图鉴在不同屏幕尺寸上都能良好显示，以便我可以在任何设备上浏览生物。

#### 验收标准

1. THE Gallery System SHALL adapt the grid layout based on screen width (1 column on mobile, 2-3 on tablet, 3-4 on desktop)
2. THE Creature Card SHALL maintain readable text and properly sized images on all screen sizes
3. THE Detail View SHALL be fully functional and readable on mobile devices
4. THE Gallery System SHALL use touch-friendly button sizes on mobile devices
5. THE Gallery System SHALL maintain performance with smooth scrolling on all devices

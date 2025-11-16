# Implementation Plan

- [x] 1. 创建轮廓提取服务





  - 实现 ContourExtractionService 类
  - 实现边缘检测算法（使用 Canvas API）
  - 实现轮廓平滑和归一化
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 1.1 实现 ContourExtractionService 基础结构


  - 创建 backend/src/services/ContourExtractionService.ts
  - 定义接口和类型（ContourPoint, Vector2, ContourData）
  - 实现构造函数和基础方法框架
  - _Requirements: 1.1, 5.1_

- [x] 1.2 实现边缘检测算法


  - 实现图像加载到 Canvas
  - 实现 Sobel 边缘检测算法
  - 实现轮廓跟踪算法
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 1.3 实现轮廓后处理


  - 实现高斯平滑算法
  - 实现轮廓点采样（控制点数在 200-300）
  - 实现坐标归一化到 [-1, 1] 范围
  - _Requirements: 5.2, 5.3_

- [x] 1.4 添加错误处理和后备方案


  - 实现默认圆形轮廓生成
  - 添加超时处理（3 秒）
  - 添加错误日志
  - _Requirements: 5.5_
-

- [x] 2. 创建 API 端点



  - 添加轮廓提取 API 路由
  - 实现请求验证
  - 集成 ContourExtractionService
  - _Requirements: 1.1, 5.1_

- [x] 2.1 创建轮廓提取路由


  - 创建 backend/src/routes/contour.ts
  - 定义 POST /api/contour/extract 端点
  - 实现请求体验证（图像 URL 或 base64）
  - _Requirements: 1.1_

- [x] 2.2 创建轮廓控制器


  - 创建 backend/src/controllers/ContourController.ts
  - 实现 extractContour 方法
  - 调用 ContourExtractionService
  - 返回轮廓数据 JSON
  - _Requirements: 1.1, 5.1_

- [x] 2.3 更新生物创建流程


  - 修改 CreatureController 在创建生物时提取轮廓
  - 将轮廓数据存储到数据库
  - 更新 Creature 模型添加 contourData 字段
  - _Requirements: 1.1_
-

- [x] 3. 创建 ParticleOutlineViewer 组件



  - 实现 Three.js 粒子系统
  - 实现动画循环
  - 实现资源清理
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.1 创建组件基础结构


  - 创建 frontend/src/components/ParticleOutlineViewer.tsx
  - 定义 Props 接口
  - 实现组件框架和 useEffect 钩子
  - _Requirements: 1.2_

- [x] 3.2 实现 Three.js 场景初始化


  - 创建 Scene、Camera、Renderer
  - 创建圆形粒子纹理
  - 设置光照
  - _Requirements: 1.2, 1.4_

- [x] 3.3 实现粒子系统创建


  - 根据轮廓点创建 BufferGeometry
  - 设置 position、color、size 属性
  - 创建 PointsMaterial 使用圆形纹理
  - 添加粒子系统到场景
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 3.4 实现动画循环


  - 实现呼吸效果（整体缩放）
  - 实现流动效果（粒子沿轮廓移动）
  - 实现深度波动效果（Z 轴变化）
  - 实现粒子大小脉动效果
  - 根据情绪值计算动画参数
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3_

- [x] 3.5 实现颜色渐变


  - 根据生物颜色生成粒子颜色数组
  - 实现沿轮廓的颜色渐变
  - 使用与球体相同的颜色方案
  - _Requirements: 1.5, 4.1, 4.4_

- [x] 3.6 实现资源清理


  - 在组件卸载时清理 Three.js 资源
  - 取消动画循环
  - 移除 DOM 元素
  - _Requirements: 3.5_
-

- [x] 4. 更新 CreatureInfoPanel 组件



  - 添加粒子轮廓显示区域
  - 集成 ParticleOutlineViewer
  - 实现响应式布局
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 更新 CreatureInfoPanel 布局


  - 修改 frontend/src/components/CreatureInfoPanel.tsx
  - 添加右侧粒子轮廓显示区域
  - 实现两栏布局（信息 + 粒子）
  - 确保响应式设计
  - _Requirements: 3.1, 3.4_

- [x] 4.2 集成 ParticleOutlineViewer


  - 导入 ParticleOutlineViewer 组件
  - 传递轮廓数据、颜色、情绪值等 props
  - 处理轮廓数据加载状态
  - _Requirements: 3.2, 3.3_

- [x] 4.3 添加加载和错误状态


  - 显示加载指示器
  - 处理轮廓数据不可用的情况
  - 显示错误消息
  - _Requirements: 3.5_
-

- [x] 5. 更新前端数据获取




  - 更新 API 客户端获取轮廓数据
  - 更新类型定义
  - 实现轮廓数据缓存
  - _Requirements: 1.1, 3.2_



- [x] 5.1 更新 CreatureProfile 类型

  - 修改 frontend/src/types/creature.ts
  - 添加 contourData 字段
  - 定义 Vector2 和 ContourData 类型
  - _Requirements: 1.1_


- [x] 5.2 更新 API 客户端

  - 修改 frontend/src/services/api.ts
  - 确保获取生物数据时包含轮廓数据
  - 添加单独获取轮廓的方法（如果需要）
  - _Requirements: 3.2_
-

- [x] 6. 测试和优化




  - 测试轮廓提取准确性
  - 测试动画性能
  - 优化粒子数量
  - _Requirements: 2.5, 5.1_


- [x] 6.1 测试轮廓提取

  - 测试不同类型的图像（简单、复杂、透明背景）
  - 验证轮廓点数量在合理范围
  - 验证轮廓平滑效果
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 测试动画性能


  - 使用 Chrome DevTools 监控 FPS
  - 测试不同粒子数量的性能影响
  - 确保 60 FPS 稳定性
  - _Requirements: 2.5_

- [x] 6.3 优化和调整


  - 根据测试结果调整粒子数量
  - 优化动画参数
  - 调整颜色渐变效果
  - _Requirements: 2.5, 4.5_

# 通义千问 API 配置指南

## 已完成的迁移

所有 AI 服务已从 OpenAI 迁移到通义千问（Qwen）：

### 1. 对话服务 (ConversationAIService)
- **模型**: `qwen-plus`
- **功能**: 生物智能体对话
- **特点**: 
  - 根据生物性格、背景故事生成个性化回复
  - 支持情绪值动态调整对话风格
  - 保持对话历史上下文

### 2. 图像分析服务 (ImageAnalysisService)
- **模型**: `qwen-vl-plus`
- **功能**: 分析生物图像，提取视觉特征
- **输出**: 主色调、视觉风格、复杂度评分

### 3. 档案生成服务 (ProfileGeneratorService)
- **模型**: `qwen-plus`
- **功能**: 生成生物完整档案
- **输出**: 名称、物种、性格、栖息地、背景故事

## 配置步骤

### 1. 获取 API Key

访问 [通义千问控制台](https://dashscope.console.aliyun.com/apiKey) 获取你的 API Key

### 2. 配置环境变量

在 `backend/.env` 文件中添加：

```env
QWEN_API_KEY=sk-your-api-key-here
```

### 3. 重启服务

```bash
cd backend
npm run dev
```

## API 端点

通义千问使用 OpenAI 兼容模式：
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **对话**: `/chat/completions`

## 可用模型

- `qwen-plus`: 通用对话模型，性价比高
- `qwen-turbo`: 更快速的模型
- `qwen-max`: 最强大的模型
- `qwen-vl-plus`: 视觉理解模型

## 费用参考

- qwen-plus: ¥0.004/1K tokens (输入), ¥0.012/1K tokens (输出)
- qwen-vl-plus: ¥0.008/1K tokens (输入), ¥0.008/1K tokens (输出)

## 降级策略

如果 API Key 未配置或调用失败，系统会自动使用 fallback 模式：
- 对话服务：返回预设的随机回复
- 图像分析：返回默认的视觉特征
- 档案生成：返回基础的生物档案

## 测试

启动服务后，可以通过以下方式测试：

1. **对话功能**: 发送消息给任意生物
2. **图像分析**: 上传生物图像
3. **档案生成**: 创建新生物

查看控制台日志确认 API 调用成功。

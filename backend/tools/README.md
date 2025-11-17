# 🛠️ 开发工具脚本

本目录包含用于调试和测试的工具脚本。

## 轮廓提取工具

### check-contour-data.js
检查数据库中所有生物的轮廓数据状态。

```bash
node backend/tools/check-contour-data.js
```

**输出示例**：
```
Creature 1: 星之灵
  - Has contour data: Yes
  - Points count: 300
  - Bounding box: {...}

Creature 2: 月之歌
  - Has contour data: No
```

### clear-contour-data.js
清除数据库中所有生物的轮廓数据（用于重新生成）。

```bash
node backend/tools/clear-contour-data.js
```

**警告**：此操作不可逆，清除后需要重新提取轮廓。

### visualize-contour.js
可视化轮廓提取过程，生成调试图片。

```bash
node backend/tools/visualize-contour.js
```

**生成文件**：
- `debug-alpha-mask.png` - Alpha 通道可视化
- `debug-boundary.png` - 边界像素可视化
- `debug-background-removal.png` - 背景移除结果

### test-contour-extraction.ts
测试轮廓提取算法的准确性。

```bash
npx ts-node backend/tools/test-contour-extraction.ts
```

### test-creature-contour.ts
测试特定生物的轮廓提取。

```bash
npx ts-node backend/tools/test-creature-contour.ts
```

### test-contour-debug.ts
详细的轮廓提取调试信息。

```bash
npx ts-node backend/tools/test-contour-debug.ts
```

### test-new-algorithm.js
测试新的轮廓提取算法。

```bash
node backend/tools/test-new-algorithm.js
```

## 使用场景

### 场景 1：检查轮廓数据状态
```bash
node backend/tools/check-contour-data.js
```

### 场景 2：重新生成所有轮廓
```bash
# 1. 清除现有数据
node backend/tools/clear-contour-data.js

# 2. 重启后端服务
cd backend && npm run dev

# 3. 在前端点击生物，自动重新生成
```

### 场景 3：调试轮廓提取问题
```bash
# 1. 生成可视化图片
node backend/tools/visualize-contour.js

# 2. 查看生成的 debug-*.png 文件
# 3. 分析问题所在
```

### 场景 4：测试新算法
```bash
# 修改算法后测试
npx ts-node backend/tools/test-contour-extraction.ts
```

## 注意事项

1. **数据库连接**：确保后端 `.env` 配置正确
2. **文件路径**：脚本需要在项目根目录运行
3. **依赖安装**：确保已运行 `npm install`
4. **备份数据**：清除操作前建议备份数据库

## 开发新工具

创建新工具脚本的模板：

```javascript
// backend/tools/my-tool.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 你的逻辑
    const [rows] = await connection.query('SELECT * FROM creatures');
    console.log('Found', rows.length, 'creatures');
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
```

运行：
```bash
node backend/tools/my-tool.js
```

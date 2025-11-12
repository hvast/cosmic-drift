# 修复 401 Unauthorized 错误

## 问题原因

401 错误表示用户未通过认证。可能的原因：

1. ❌ **用户未登录** - localStorage 中没有 accessToken
2. ❌ **Token 已过期** - JWT token 超过有效期（通常是1小时）
3. ❌ **Token 格式错误** - token 被损坏
4. ❌ **后端认证中间件问题** - token 验证失败

## 快速诊断

### 方法1：使用调试工具（推荐）

1. 确保后端正在运行（http://localhost:3001）
2. 用浏览器打开 `debug-auth.html` 文件
3. 按照页面上的步骤操作：
   - 检查 Token 状态
   - 测试登录
   - 测试创建生物 API

### 方法2：浏览器开发者工具

1. 打开你的应用 http://localhost:3000
2. 按 F12 打开开发者工具
3. 切换到 **Console** 标签
4. 输入以下命令检查 token：

```javascript
// 检查是否有 token
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// 检查 token 是否过期
const token = localStorage.getItem('accessToken');
if (token) {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    const exp = new Date(payload.exp * 1000);
    console.log('Token 过期时间:', exp);
    console.log('当前时间:', new Date());
    console.log('是否过期:', exp < new Date());
}
```

## 解决方案

### 解决方案1：重新登录（最简单）

1. 在应用中点击"退出登录"（如果有）
2. 或者在浏览器 Console 中运行：
   ```javascript
   localStorage.removeItem('accessToken');
   localStorage.removeItem('refreshToken');
   location.reload();
   ```
3. 重新登录
4. 再次尝试创建生物

### 解决方案2：检查登录状态

在 `CreatePage.tsx` 中，确保用户已登录：

```typescript
import { useAuth } from '../contexts/AuthContext';

const CreatePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 添加这个检查
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // ... 其他代码
}
```

### 解决方案3：添加自动重定向

如果 token 过期，自动跳转到登录页：

修改 `frontend/src/services/api.ts`：

```typescript
async request<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = false
): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;
  const headers = this.getHeaders(includeAuth);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // 添加这个检查
      if (response.status === 401) {
        // Token 过期，清除并跳转到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      
      throw data.error || { code: 'UNKNOWN_ERROR', message: 'An error occurred' };
    }

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    throw {
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to server',
      timestamp: new Date(),
    };
  }
}
```

### 解决方案4：实现 Token 自动刷新

修改 `frontend/src/services/api.ts`，添加自动刷新逻辑：

```typescript
private async refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.tokens.refreshToken);
  
  return data.tokens.accessToken;
}

async request<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = false
): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;
  let headers = this.getHeaders(includeAuth);

  try {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // 如果是 401 且需要认证，尝试刷新 token
    if (response.status === 401 && includeAuth) {
      try {
        const newToken = await this.refreshAccessToken();
        headers = this.getHeaders(true); // 获取新的 headers
        
        // 重试请求
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw data.error || { code: 'UNKNOWN_ERROR', message: 'An error occurred' };
    }

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    throw {
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to server',
      timestamp: new Date(),
    };
  }
}
```

## 立即测试

### 测试步骤：

1. **确保后端运行**
   ```bash
   cd backend
   npm run dev
   ```

2. **打开调试工具**
   - 双击 `debug-auth.html` 文件
   - 或在浏览器中打开

3. **执行测试**
   - 点击"刷新检查" - 查看 token 状态
   - 如果没有 token 或已过期，点击"测试登录"
   - 登录成功后，点击"测试创建生物"

4. **查看结果**
   - ✅ 如果成功，说明认证正常
   - ❌ 如果失败，查看具体错误信息

## 常见问题

### Q: Token 一直显示已过期？
A: JWT token 默认有效期是1小时。如果超过1小时未使用，需要重新登录。

### Q: 登录后立即显示 401？
A: 检查后端的 JWT_SECRET 是否配置正确，前后端的密钥必须一致。

### Q: 在前端应用中登录成功，但创建生物时还是 401？
A: 
1. 检查浏览器 Console 是否有错误
2. 检查 Network 标签，确认请求头中有 `Authorization: Bearer ...`
3. 确认 localStorage 中确实保存了 token

### Q: 如何延长 token 有效期？
A: 修改 `backend/src/utils/jwt.ts` 中的 `expiresIn` 配置：

```typescript
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h' // 改为24小时
  });
};
```

## 需要帮助？

如果以上方法都无法解决，请提供：
1. `debug-auth.html` 中的测试结果截图
2. 浏览器 Console 中的错误信息
3. 浏览器 Network 标签中 `/api/creatures` 请求的详细信息

# 环境变量配置指南

## 概述

本项目使用 Vite 的环境变量系统来管理不同环境的配置。所有环境变量必须以 `VITE_` 前缀开头才能在客户端代码中使用。

## 环境文件结构

```
.env                # 默认配置（所有环境）
.env.development    # 开发环境专用配置
.env.production     # 生产环境专用配置
.env.example        # 环境变量示例文件
```

## 环境变量列表

### 必需变量

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_API_URL` | API 服务器基础URL | `http://localhost:3000/api` |

### 可选变量

| 变量名 | 说明 | 默认值 | 示例 |
|-------|------|-------|------|
| `VITE_APP_NAME` | 应用名称 | `AIBFARM` | `AIBFARM` |
| `VITE_APP_VERSION` | 应用版本 | `1.0.0` | `1.0.0` |
| `VITE_ENABLE_DEV_TOOLS` | 启用开发工具 | `false` | `true` |
| `VITE_API_DEBUG` | API调试模式 | `false` | `true` |
| `VITE_NODE_ENV` | 自定义环境标识 | - | `development` |

## 快速开始

### 1. 复制示例文件
```bash
cp .env.example .env
```

### 2. 配置环境变量
根据你的开发环境修改 `.env` 文件：

```bash
# 基础配置
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AIBFARM
VITE_APP_VERSION=1.0.0

# 开发配置
VITE_ENABLE_DEV_TOOLS=true
VITE_API_DEBUG=true
```

### 3. 不同环境的配置

#### 开发环境 (.env.development)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_DEV_TOOLS=true
VITE_API_DEBUG=true
```

#### 生产环境 (.env.production)
```bash
VITE_API_URL=https://api.aibfarm.com/api
VITE_ENABLE_DEV_TOOLS=false
VITE_API_DEBUG=false
```

## 使用方式

### 在代码中访问环境变量

```typescript
// 直接访问
const apiUrl = import.meta.env.VITE_API_URL;

// 使用配置对象（推荐）
import { config } from '@/config/env';
const apiUrl = config.api.baseUrl;
```

### 环境检查

```typescript
import { config } from '@/config/env';

if (config.isDevelopment) {
  console.log('开发环境');
}

if (config.isProduction) {
  console.log('生产环境');
}
```

## TypeScript 支持

环境变量的 TypeScript 类型定义在 `src/vite-env.d.ts` 中：

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  // ... 其他变量
}
```

## 安全注意事项

⚠️ **重要**：由于 Vite 会将环境变量打包到客户端代码中，**不要在环境变量中存储敏感信息**（如API密钥、数据库密码等）。

### 安全实践
- ✅ API端点URL
- ✅ 功能开关标志
- ✅ 公开配置信息
- ❌ API密钥
- ❌ 数据库凭据
- ❌ 私人令牌

## CI/CD 配置

### GitHub Actions

在 GitHub Actions 中设置环境变量：

1. 访问仓库的 Settings > Secrets and variables > Actions
2. 添加以下变量：

```yaml
# Repository secrets
VITE_API_URL_PROD=https://api.aibfarm.com/api

# 在工作流中使用
- name: Build
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL_PROD }}
```

### 其他部署平台

#### Vercel
在项目设置中添加环境变量，或使用 `vercel env` 命令：

```bash
vercel env add VITE_API_URL production
```

#### Netlify
在站点设置中添加环境变量，或在 `netlify.toml` 中配置：

```toml
[build.environment]
  VITE_API_URL = "https://api.aibfarm.com/api"
```

## 故障排除

### 常见问题

1. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 重启开发服务器
   - 检查文件名和语法

2. **TypeScript 类型错误**
   - 更新 `src/vite-env.d.ts` 文件
   - 添加新变量的类型定义

3. **构建时环境变量丢失**
   - 检查 CI/CD 环境是否正确设置
   - 验证 `.env.production` 文件

### 调试工具

启用 API 调试模式来查看配置信息：

```bash
VITE_API_DEBUG=true npm run dev
```

这会在浏览器控制台显示：
- API 基础URL
- 当前环境
- 配置详情

## 环境变量优先级

Vite 按以下顺序加载环境文件：

1. `.env.{mode}.local` （最高优先级）
2. `.env.{mode}`
3. `.env.local`
4. `.env` （最低优先级）

其中 `{mode}` 是当前模式（development、production 等）。

## 最佳实践

1. **使用配置对象**：通过 `@/config/env` 统一管理
2. **文档化**：为每个环境变量添加说明
3. **验证**：在应用启动时验证必需的环境变量
4. **版本控制**：
   - ✅ 提交 `.env.example`
   - ❌ 不要提交 `.env`、`.env.local` 文件
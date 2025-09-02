# AIBFARM Frontend

现代化的金融平台前端应用，使用 React + TypeScript + Tailwind CSS 构建。

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Framer Motion** - 强大的动画库
- **React Hook Form** - 高性能表单处理
- **Axios** - HTTP 客户端
- **React Router** - 路由管理
- **Vite** - 快速的构建工具

## 功能特性

### 注册页面 (`/register`)
- 🎨 紫色渐变背景配动态浮动元素
- ✨ 实时密码强度检测
- 🔐 表单验证与错误提示动画
- 🌐 社交登录集成（微信、Google）
- 📱 完全响应式设计

### 充值页面 (`/deposit`)
- 💫 蓝色渐变背景配粒子动画效果
- 💰 实时余额显示
- 🎯 快捷金额选择
- 💳 多种支付方式（支付宝、微信、银行卡、数字货币）
- 🎁 优惠码功能
- ✅ 成功动画反馈

## 安装与运行

**重要：如果 npm 命令无法识别，请先加载 nvm：**

```bash
# 加载 nvm 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

**快速启动：**
```bash
# 一行命令启动开发服务器
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && npm install && npm run dev
```

访问地址：
- 注册页面: http://localhost:5173/register
- 充值页面: http://localhost:5173/deposit

## 项目结构

```
src/
├── components/       # React 组件
│   ├── Register.tsx  # 注册页面组件
│   └── Deposit.tsx   # 充值页面组件
├── services/         # API 服务
│   └── api.ts       # API 接口封装
├── App.tsx          # 应用主组件
├── main.tsx         # 应用入口
└── index.css        # 全局样式
```

## API 配置

API 基础 URL 可通过环境变量配置：

```bash
REACT_APP_API_URL=https://api.aibfarm.com
```

默认使用 `/api` 作为基础路径。

## 部署

构建生产版本：

```bash
npm run build
```

构建完成后，`dist` 目录包含所有静态文件，可部署到任何静态文件服务器。

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)
# 测试文档

## 测试概览

本项目使用 Vitest + React Testing Library 进行单元测试和集成测试。

## 测试结构

```
src/
├── components/
│   └── __tests__/
│       └── basic.test.tsx       # 基础组件测试
├── services/
│   ├── __tests__/
│   │   └── api.test.ts          # API服务测试
│   └── __mocks__/
│       └── api.ts               # API模拟
└── test/
    ├── setup.ts                 # 测试环境设置
    └── utils.tsx                # 测试工具函数
```

## 测试覆盖的功能

### 基础功能测试 (`basic.test.tsx`)
- ✅ 组件渲染测试
- ✅ 用户交互测试
- ✅ 表单验证测试
- ✅ 异步操作测试
- ✅ React Router 集成测试

### API服务测试 (`api.test.ts`)
- ✅ API函数存在性验证
- ✅ API对象结构验证

## 测试脚本

```bash
# 运行所有测试
npm test

# 运行测试并生成报告
npm run test:run

# 运行测试并显示UI界面
npm run test:ui
```

## 测试环境配置

### Mock配置
- **framer-motion**: 模拟动画库，过滤动画属性
- **react-hot-toast**: 模拟通知库
- **clipboard API**: 模拟剪贴板操作
- **localStorage**: 模拟本地存储

### 测试工具
- **Vitest**: 测试运行器和断言库
- **React Testing Library**: React组件测试工具
- **User Events**: 用户交互模拟
- **jsdom**: DOM环境模拟

## CI/CD集成

测试在GitHub Actions中自动运行：

```yaml
- name: Run tests
  run: npm run test:run
```

### 工作流程
1. **Pull Request**: 所有PR都会运行测试
2. **推送到main**: 运行测试 → 通过后部署到GitHub Pages
3. **手动触发**: 支持手动运行测试和部署

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 使用 `it('should do something when condition')`格式

### 2. 组件测试
- 测试组件渲染而不是实现细节
- 使用 `data-testid` 属性选择元素
- 模拟用户真实交互

### 3. 异步测试
- 使用 `await screen.findBy...()` 等待异步操作
- 正确处理Promise和异步状态

### 4. Mock使用
- 只mock必要的依赖
- 保持mock简单和可维护

## 添加新测试

### 组件测试模板
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/utils'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 故障排除

### 常见问题
1. **framer-motion 警告**: 已通过custom mock解决
2. **React Router 警告**: 正常，可以忽略
3. **异步测试失败**: 使用正确的等待方式

### Debug技巧
```typescript
// 打印当前DOM结构
screen.debug()

// 查找元素的多种方式
screen.getByRole('button', { name: /submit/i })
screen.getByTestId('submit-button')
screen.getByLabelText(/username/i)
```

## 测试报告

运行测试后会显示：
- ✅ 通过的测试数量
- ❌ 失败的测试详情
- 📊 测试覆盖率信息
- ⏱️ 运行时间统计
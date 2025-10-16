# 充值香火 API 测试工具

## 简介

这是一个用于测试充值香火 API 的 Python 压力测试脚本，可以进行单次测试和并发压力测试。

## 安装依赖

```bash
pip install requests
```

或者使用 requirements.txt：

```bash
pip install -r requirements.txt
```

## 配置

在运行测试前，请修改 `deposit_stress_test.py` 文件中的配置参数：

### 1. API 地址

```python
API_URL = "https://new.aibfarm.com/aibfarm.deposit"  # 实际的 API 地址
```

### 2. 测试账号信息

```python
TEST_ACCOUNTS = [
    {
        "username": "your_email@example.com",  # 用户名/邮箱
        "password": "your_password",           # 密码
        "referenceCode": "your_reference_id",  # 参考编号（FromWdID）
        "amount": "0.1"                        # 充值金额（支持小数）
    },
    # 可以添加更多测试账号
]
```

**注意**:
- `referenceCode` 对应 API 的 `FromWdID` 参数
- `amount` 对应 API 的 `Amt` 参数

### 3. 并发测试参数

```python
CONCURRENT_USERS = 10      # 并发用户数
REQUESTS_PER_USER = 5      # 每个用户发送的请求数
REQUEST_DELAY = 0.1        # 请求之间的延迟（秒）
REQUEST_TIMEOUT = 30       # 请求超时时间（秒）
```

## 使用方法

### 运行测试

```bash
python deposit_stress_test.py
```

或者：

```bash
chmod +x deposit_stress_test.py
./deposit_stress_test.py
```


### 快速开始

  ####  1. 进入测试目录
```
  cd tests/python
```
  ####  2. 安装依赖
```
  pip install -r requirements.txt
```
  ####  3. 运行测试
```
  python deposit_stress_test.py
```
  脚本会显示菜单：
  - 选择 1 - 单次测试（验证 API 是否正常）
  - 选择 2 - 压力测试（并发 10 用户 × 5 次 = 50 个请求）

  📊 测试结果

  测试完成后会显示：
  - 总请求数、成功/失败数、成功率
  - 平均/最快/最慢响应时间
  - 请求吞吐量
  - 自动生成 JSON 报告文件

  现在您可以直接运行测试脚本了！如需调整测试参数（并发数、请求次数等），只需修改脚本开头的配置变量即可。



### 测试模式

运行后会显示菜单：

```
充值香火 API 测试工具
1. 单次测试（验证 API）
2. 压力测试（并发测试）
3. 退出

请选择测试模式 [1-3]:
```

#### 模式 1: 单次测试

- 用于快速验证 API 是否正常工作
- 发送一个测试请求
- 显示响应结果和响应时间

#### 模式 2: 压力测试

- 模拟多个用户并发访问
- 发送大量请求测试 API 稳定性
- 生成详细的测试报告

## 测试报告

压力测试完成后会生成以下内容：

### 1. 控制台输出

```
============================================================
测试结果统计
============================================================
总请求数: 50
成功请求数: 48
失败请求数: 2
成功率: 96.00%
平均响应时间: 0.234s
最快响应时间: 0.123s
最慢响应时间: 0.456s
总测试时间: 15.678s
请求吞吐量: 3.19 req/s
============================================================
```

### 2. JSON 报告文件

生成文件名格式: `deposit_test_report_YYYYMMDD_HHMMSS.json`

包含完整的测试配置和结果数据。

## 测试场景示例

### 场景 1: 轻量级测试

```python
CONCURRENT_USERS = 5       # 5个并发用户
REQUESTS_PER_USER = 2      # 每人2个请求
REQUEST_DELAY = 0.5        # 延迟0.5秒
# 总共: 10个请求
```

### 场景 2: 中等压力测试

```python
CONCURRENT_USERS = 20      # 20个并发用户
REQUESTS_PER_USER = 10     # 每人10个请求
REQUEST_DELAY = 0.1        # 延迟0.1秒
# 总共: 200个请求
```

### 场景 3: 高强度压力测试

```python
CONCURRENT_USERS = 100     # 100个并发用户
REQUESTS_PER_USER = 50     # 每人50个请求
REQUEST_DELAY = 0.01       # 延迟0.01秒
# 总共: 5000个请求
```

### 场景 4: 瞬时峰值测试

```python
CONCURRENT_USERS = 200     # 200个并发用户
REQUESTS_PER_USER = 1      # 每人1个请求
REQUEST_DELAY = 0          # 无延迟
# 总共: 200个瞬时并发请求
```

## API 请求格式

脚本会发送以下格式的请求：

```bash
POST https://new.aibfarm.com/aibfarm.deposit
Content-Type: application/json
Authorization: Basic dGVtcGxlOnhYeHh4WHh4LnhYeA==

{
  "Username": "your_email@example.com",
  "Password": "your_password",
  "FromWdID": "your_reference_id",
  "Amt": "0.1"
}
```

脚本自动包含所有必需的 HTTP headers，包括：
- Authorization（Basic Auth）
- Origin 和 Referer（CORS）
- User-Agent（浏览器标识）
- 其他安全相关 headers

## 注意事项

1. **请勿在生产环境直接运行高强度测试**，可能导致服务器过载
2. 建议先在测试环境运行，逐步增加并发量
3. 使用真实但独立的测试账号，避免影响生产数据
4. 注意监控服务器资源使用情况（CPU、内存、网络）
5. 根据实际 API 响应时间调整 `REQUEST_TIMEOUT` 参数
6. **注意**：脚本包含 Authorization header，确保只在授权的测试环境使用

## 常见问题

### Q: 大量请求失败，显示"连接错误"

A: 可能原因：
- API 服务未启动
- API 地址配置错误
- 防火墙或网络限制
- 服务器达到最大连接数限制

### Q: 所有请求都超时

A: 可能原因：
- `REQUEST_TIMEOUT` 设置过小
- API 响应速度慢
- 服务器负载过高
- 建议增加超时时间或减少并发量

### Q: 成功率低，显示 "API Error"

A: 可能原因：
- 测试账号信息错误
- API 业务逻辑限制（如余额不足、重复提交等）
- 需要检查具体的错误信息

## 扩展功能

可以根据需要扩展脚本功能：

1. **动态生成测试数据**: 随机生成充值金额
2. **添加监控**: 实时监控 API 响应时间
3. **结果可视化**: 生成图表展示测试结果
4. **持续压测**: 设置持续运行时间而非请求次数
5. **数据库验证**: 验证充值记录是否正确写入数据库

## 许可证

MIT License

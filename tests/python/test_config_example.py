"""
测试配置示例文件
复制此文件并重命名为 test_config.py，然后修改以下参数
"""

# API 地址
API_URL = "https://new.aibfarm.com/aibfarm.deposit"

# 测试账号列表（可以添加多个账号进行测试）
TEST_ACCOUNTS = [
    {
        "username": "your_email@example.com",  # 用户名/邮箱
        "password": "your_password",            # 密码
        "referenceCode": "your_reference_code", # 参考编号/FromWdID
        "amount": "0.1"                         # 充值金额（支持小数）
    },
    # 可以添加更多测试账号
    # {
    #     "username": "user2@example.com",
    #     "password": "password2",
    #     "referenceCode": "REF002",
    #     "amount": "1.0"
    # },
]

# 并发测试配置
CONCURRENT_USERS = 10      # 并发用户数（同时发送请求的线程数）
REQUESTS_PER_USER = 5      # 每个用户发送的请求次数
REQUEST_DELAY = 0.1        # 请求之间的延迟（秒），避免瞬间发送所有请求
REQUEST_TIMEOUT = 30       # 单个请求的超时时间（秒）

# 计算总请求数
TOTAL_REQUESTS = CONCURRENT_USERS * REQUESTS_PER_USER

# HTTP Headers（从浏览器复制的实际请求头）
REQUEST_HEADERS = {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "authorization": "Basic dGVtcGxlOnhYeHh4WHh4LnhYeA==",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "origin": "https://aibfarm.com",
    "pragma": "no-cache",
    "referer": "https://aibfarm.com/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
}

# 测试场景说明
"""
轻量级测试:
    CONCURRENT_USERS = 5
    REQUESTS_PER_USER = 2
    总共: 10个请求

中等压力测试:
    CONCURRENT_USERS = 20
    REQUESTS_PER_USER = 10
    总共: 200个请求

高强度压力测试:
    CONCURRENT_USERS = 100
    REQUESTS_PER_USER = 50
    总共: 5000个请求

瞬时峰值测试:
    CONCURRENT_USERS = 200
    REQUESTS_PER_USER = 1
    REQUEST_DELAY = 0
    总共: 200个瞬时并发请求
"""

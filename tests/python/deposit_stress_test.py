#!/usr/bin/env python3
"""
充值香火 API 暴力测试脚本
用于测试充值接口的稳定性和并发能力
"""

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Dict, Any

# ============================================
# 测试配置 - 在这里修改测试参数
# ============================================

# API 配置
API_URL = "https://new.aibfarm.com/aibfarm.deposit"  # 修改为实际的 API 地址

# 测试账号信息
TEST_ACCOUNTS = [
    {
        "username": "aaa@gmail.com",
        "password": "aaa",
        "referenceCode": "1111",  # FromWdID
        "amount": "1"
    },

    # 可以添加更多测试账号
]

# 并发测试配置
CONCURRENT_USERS = 100  # 并发用户数
REQUESTS_PER_USER = 10  # 每个用户发送的请求数
REQUEST_DELAY = 0.01    # 请求之间的延迟（秒）

# 超时设置
REQUEST_TIMEOUT = 30  # 请求超时时间（秒）

# ============================================
# 测试结果统计
# ============================================

class TestStats:
    """测试结果统计"""
    def __init__(self):
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.response_times = []
        self.errors = []
        self.lock = threading.Lock()

    def add_result(self, success: bool, response_time: float, error: str = None):
        """添加测试结果"""
        with self.lock:
            self.total_requests += 1
            if success:
                self.successful_requests += 1
            else:
                self.failed_requests += 1
                if error:
                    self.errors.append(error)
            self.response_times.append(response_time)

    def get_summary(self) -> Dict[str, Any]:
        """获取统计摘要"""
        with self.lock:
            avg_response_time = sum(self.response_times) / len(self.response_times) if self.response_times else 0
            min_response_time = min(self.response_times) if self.response_times else 0
            max_response_time = max(self.response_times) if self.response_times else 0

            return {
                "total_requests": self.total_requests,
                "successful_requests": self.successful_requests,
                "failed_requests": self.failed_requests,
                "success_rate": f"{(self.successful_requests / self.total_requests * 100):.2f}%" if self.total_requests > 0 else "0%",
                "avg_response_time": f"{avg_response_time:.3f}s",
                "min_response_time": f"{min_response_time:.3f}s",
                "max_response_time": f"{max_response_time:.3f}s",
                "errors": self.errors
            }

# ============================================
# 测试函数
# ============================================

def send_deposit_request(account: Dict[str, str], stats: TestStats, request_id: int):
    """
    发送单个充值请求

    Args:
        account: 账号信息字典
        stats: 统计对象
        request_id: 请求ID
    """
    start_time = time.time()

    try:
        # 根据实际 API 要求构建请求参数
        payload = {
            "Username": account["username"],
            "Password": account["password"],
            "FromWdID": account["referenceCode"],
            "Amt": account["amount"]
        }

        # 根据实际 curl 请求构建 headers
        headers = {
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

        response = requests.post(
            API_URL,
            json=payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )

        response_time = time.time() - start_time

        # 判断请求是否成功
        if response.status_code >= 200 and response.status_code < 300:
            # 检查响应体是否有错误
            try:
                response_data = response.json()
                if response_data.get("err"):
                    stats.add_result(False, response_time, f"API Error: {response_data.get('err')}")
                    print(f"❌ 请求 #{request_id} 失败: {response_data.get('err')} ({response_time:.3f}s)")
                else:
                    stats.add_result(True, response_time)
                    print(f"✅ 请求 #{request_id} 成功 ({response_time:.3f}s)")
            except json.JSONDecodeError:
                # 如果响应不是 JSON，但状态码是 2xx，视为成功
                stats.add_result(True, response_time)
                print(f"✅ 请求 #{request_id} 成功 ({response_time:.3f}s)")
        else:
            error_msg = f"HTTP {response.status_code}: {response.text[:100]}"
            stats.add_result(False, response_time, error_msg)
            print(f"❌ 请求 #{request_id} 失败: {error_msg} ({response_time:.3f}s)")

    except requests.exceptions.Timeout:
        response_time = time.time() - start_time
        error_msg = f"请求超时 (>{REQUEST_TIMEOUT}s)"
        stats.add_result(False, response_time, error_msg)
        print(f"❌ 请求 #{request_id} 超时 ({response_time:.3f}s)")

    except requests.exceptions.ConnectionError as e:
        response_time = time.time() - start_time
        error_msg = f"连接错误: {str(e)[:100]}"
        stats.add_result(False, response_time, error_msg)
        print(f"❌ 请求 #{request_id} 连接失败 ({response_time:.3f}s)")

    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"未知错误: {str(e)[:100]}"
        stats.add_result(False, response_time, error_msg)
        print(f"❌ 请求 #{request_id} 异常: {error_msg} ({response_time:.3f}s)")

def run_stress_test():
    """
    运行压力测试
    """
    print("\n" + "="*60)
    print("充值香火 API 暴力测试")
    print("="*60)
    print(f"API 地址: {API_URL}")
    print(f"并发用户数: {CONCURRENT_USERS}")
    print(f"每用户请求数: {REQUESTS_PER_USER}")
    print(f"总请求数: {CONCURRENT_USERS * REQUESTS_PER_USER}")
    print(f"测试账号数: {len(TEST_ACCOUNTS)}")
    print("="*60 + "\n")

    stats = TestStats()
    start_time = time.time()

    # 使用线程池进行并发测试
    with ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
        futures = []
        request_id = 0

        # 为每个并发用户提交请求任务
        for user_id in range(CONCURRENT_USERS):
            account = TEST_ACCOUNTS[user_id % len(TEST_ACCOUNTS)]  # 循环使用测试账号

            for req_num in range(REQUESTS_PER_USER):
                request_id += 1
                future = executor.submit(send_deposit_request, account, stats, request_id)
                futures.append(future)

                # 添加延迟避免瞬间发送所有请求
                if REQUEST_DELAY > 0:
                    time.sleep(REQUEST_DELAY)

        # 等待所有请求完成
        for future in as_completed(futures):
            future.result()

    total_time = time.time() - start_time

    # 打印测试结果
    print("\n" + "="*60)
    print("测试结果统计")
    print("="*60)

    summary = stats.get_summary()
    print(f"总请求数: {summary['total_requests']}")
    print(f"成功请求数: {summary['successful_requests']}")
    print(f"失败请求数: {summary['failed_requests']}")
    print(f"成功率: {summary['success_rate']}")
    print(f"平均响应时间: {summary['avg_response_time']}")
    print(f"最快响应时间: {summary['min_response_time']}")
    print(f"最慢响应时间: {summary['max_response_time']}")
    print(f"总测试时间: {total_time:.3f}s")
    print(f"请求吞吐量: {summary['total_requests'] / total_time:.2f} req/s")

    # 打印错误信息
    if summary['errors']:
        print("\n错误详情:")
        error_counts = {}
        for error in summary['errors']:
            error_counts[error] = error_counts.get(error, 0) + 1

        for error, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  [{count}x] {error}")

    print("="*60 + "\n")

    # 保存测试报告
    report_filename = f"logs/deposit_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_data = {
        "test_config": {
            "api_url": API_URL,
            "concurrent_users": CONCURRENT_USERS,
            "requests_per_user": REQUESTS_PER_USER,
            "test_accounts_count": len(TEST_ACCOUNTS),
            "request_delay": REQUEST_DELAY,
            "request_timeout": REQUEST_TIMEOUT
        },
        "test_results": summary,
        "total_test_time": f"{total_time:.3f}s",
        "throughput": f"{summary['total_requests'] / total_time:.2f} req/s",
        "timestamp": datetime.now().isoformat()
    }

    with open(report_filename, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    print(f"📊 测试报告已保存到: {report_filename}\n")

def run_single_test():
    """
    运行单次测试（用于快速验证 API 是否正常工作）
    """
    print("\n" + "="*60)
    print("单次测试")
    print("="*60 + "\n")

    if not TEST_ACCOUNTS:
        print("❌ 错误: 没有配置测试账号")
        return

    account = TEST_ACCOUNTS[0]
    print(f"测试账号: {account['username']}")
    print(f"金额: {account['amount']} USDT\n")

    stats = TestStats()
    send_deposit_request(account, stats, 1)

    summary = stats.get_summary()
    print(f"\n结果: {'✅ 成功' if summary['successful_requests'] > 0 else '❌ 失败'}")
    print(f"响应时间: {summary['avg_response_time']}\n")

# ============================================
# 主程序
# ============================================

if __name__ == "__main__":
    import sys

    print("\n充值香火 API 测试工具")
    print("1. 单次测试（验证 API）")
    print("2. 压力测试（并发测试）")
    print("3. 退出")

    choice = input("\n请选择测试模式 [1-3]: ").strip()

    if choice == "1":
        run_single_test()
    elif choice == "2":
        confirm = input(f"\n即将发送 {CONCURRENT_USERS * REQUESTS_PER_USER} 个请求，确认继续? [y/N]: ").strip().lower()
        if confirm in ['y', 'yes']:
            run_stress_test()
        else:
            print("测试已取消")
    elif choice == "3":
        print("再见！")
        sys.exit(0)
    else:
        print("无效的选择")

import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
      withCredentials: false, // 禁用凭据以避免CORS预检请求
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          // CORS or permission error
          console.error('CORS or permission error:', error);
          if (error.code === 'ERR_NETWORK' || !error.response) {
            // Network error, likely CORS
            error.message = 'CORS错误：无法连接到API服务器，请检查网络连接或联系管理员';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    Name: string;
    Username: string;
    Password: string;
    OKX_API_KEY: string;
    OKX_API_SECRET: string;
    OKX_API_Passphrase: string;
    OKX_UID: string;
  }) {
    return this.client.post('/aibfarm.register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post('/login', data);
  }

  async logout() {
    return this.client.post('/logout');
  }

  // User endpoints
  async getProfile() {
    return this.client.get('/user/profile');
  }

  async getBalance() {
    return this.client.get('/user/balance');
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.client.put('/user/profile', data);
  }

  // Deposit endpoints
  async deposit(data: {
    Username: string;
    Password: string;
    FromWdID: string;
    Amt: string;
  }) {
    return this.client.post('/aibfarm.deposit', data);
  }

  async getDepositHistory() {
    return this.client.get('/deposit/history');
  }

  async validatePromo(code: string, amount: number) {
    return this.client.post('/promo/validate', { code, amount });
  }

  // Payment methods
  async getPaymentMethods() {
    return this.client.get('/payment/methods');
  }

  async initiatePayment(data: {
    method: string;
    amount: number;
    returnUrl?: string;
  }) {
    return this.client.post('/payment/initiate', data);
  }

  async verifyPayment(transactionId: string) {
    return this.client.get(`/payment/verify/${transactionId}`);
  }

  // Withdrawal endpoints
  async withdraw(data: {
    amount: number;
    method: string;
    account: string;
  }) {
    return this.client.post('/withdraw', data);
  }

  async getWithdrawalHistory() {
    return this.client.get('/withdraw/history');
  }

  // Transaction endpoints
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.client.get('/transactions', { params });
  }

  async getTransactionDetail(id: string) {
    return this.client.get(`/transactions/${id}`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.client.get('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.client.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.client.put('/notifications/read-all');
  }

  // Settings endpoints
  async getSettings() {
    return this.client.get('/settings');
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.client.put('/settings', data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.client.post('/settings/change-password', data);
  }

  async enable2FA() {
    return this.client.post('/settings/2fa/enable');
  }

  async disable2FA(code: string) {
    return this.client.post('/settings/2fa/disable', { code });
  }

  async verify2FA(code: string) {
    return this.client.post('/settings/2fa/verify', { code });
  }
}

export const api = new ApiService();
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).env?.REACT_APP_API_URL) || '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
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
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    okxApiKey: string;
    okxApiSecret: string;
    okxPassphrase: string;
    okxUid: string;
  }) {
    return this.client.post('/register', data);
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

  async updateProfile(data: any) {
    return this.client.put('/user/profile', data);
  }

  // Deposit endpoints
  async deposit(data: {
    username: string;
    password: string;
    referenceCode: string;
    amount: number;
  }) {
    return this.client.post('/deposit', data);
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

  async updateSettings(data: any) {
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
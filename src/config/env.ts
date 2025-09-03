// 环境变量配置
export const config = {
  // API 配置
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    debug: import.meta.env.VITE_API_DEBUG === 'true',
  },
  
  // 应用配置
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AIBFARM',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
  },
  
  // 功能开关
  features: {
    devTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  },
  
  // 环境检查
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
} as const;

// 环境验证函数
export const validateEnvironment = (): void => {
  const required = [
    'VITE_API_URL',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing);
    if (config.isDevelopment) {
      console.info('💡 Copy .env.example to .env and configure the missing variables');
    }
  }
  
  if (config.api.debug) {
    console.group('🔧 Environment Configuration');
    console.log('API Base URL:', config.api.baseUrl);
    console.log('Environment:', config.app.environment);
    console.log('Version:', config.app.version);
    console.log('Development Mode:', config.isDevelopment);
    console.groupEnd();
  }
};

// 自动验证环境变量（仅在开发环境）
if (config.isDevelopment) {
  validateEnvironment();
}
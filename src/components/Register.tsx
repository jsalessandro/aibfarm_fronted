import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, CheckCircle, AlertCircle, Wand2, ClipboardPaste, X, Save, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  okxApiKey: string;
  okxApiSecret: string;
  okxPassphrase: string;
  okxUid: string;
}

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [pastedCredentials, setPastedCredentials] = useState('');
  const [hasSavedData, setHasSavedData] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; solution?: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RegisterFormData>();

  const watchedFields = watch();

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('registerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(key => {
          if (parsedData[key]) {
            setValue(key as keyof RegisterFormData, parsedData[key]);
          }
        });
        setHasSavedData(true);
        toast.success('已恢复之前的填写内容');
      } catch (error) {
        localStorage.removeItem('registerFormData');
      }
    }
  }, [setValue]);

  // Save form data when fields change
  useEffect(() => {
    const hasAnyData = Object.values(watchedFields || {}).some(value => 
      value && typeof value === 'string' && value.trim() !== ''
    );
    
    if (hasAnyData) {
      const dataToSave = Object.fromEntries(
        Object.entries(watchedFields || {}).filter(([_, value]) => 
          value && typeof value === 'string' && value.trim() !== ''
        )
      );
      localStorage.setItem('registerFormData', JSON.stringify(dataToSave));
    }
  }, [watchedFields]);

  const clearSavedData = () => {
    localStorage.removeItem('registerFormData');
    reset();
    setHasSavedData(false);
    toast.success('已清除保存的数据');
  };

  const parseAndFillCredentials = () => {
    if (!pastedCredentials.trim()) {
      toast.error('请先粘贴OKX API凭据');
      return;
    }

    try {
      const credentials: Record<string, string> = {};
      const text = pastedCredentials.trim();

      // Try to parse as JSON first (OKX App format)
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          const jsonData = JSON.parse(text);
          
          if (jsonData.apiKey) credentials.apiKey = jsonData.apiKey;
          if (jsonData.secretKey) credentials.secretKey = jsonData.secretKey;
          if (jsonData.passphrase) credentials.passphrase = jsonData.passphrase;
          if (jsonData.uid) credentials.uid = jsonData.uid;
          if (jsonData['API name']) credentials.uid = jsonData['API name'];
        } catch (jsonError) {
          throw new Error('JSON格式解析失败');
        }
      } else {
        // Parse as key-value pairs (OKX Web format)
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        lines.forEach(line => {
          // Try different parsing patterns
          if (line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            const cleanKey = key.trim().toLowerCase();
            
            if (cleanKey.includes('apikey') || cleanKey.includes('api key')) {
              credentials.apiKey = value;
            } else if (cleanKey.includes('secretkey') || cleanKey.includes('secret')) {
              credentials.secretKey = value;
            } else if (cleanKey.includes('passphrase')) {
              credentials.passphrase = value;
            } else if (cleanKey.includes('uid') && !cleanKey.includes('备注')) {
              credentials.uid = value;
            } else if (cleanKey.includes('备注名')) {
              credentials.uid = value;
            } else if (cleanKey.includes('ip')) {
              credentials.ip = value;
            }
          } else if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            const cleanKey = key.trim().toLowerCase();
            
            if (cleanKey.includes('apikey') || cleanKey.includes('api key')) {
              credentials.apiKey = value;
            } else if (cleanKey.includes('secretkey') || cleanKey.includes('secret')) {
              credentials.secretKey = value;
            } else if (cleanKey.includes('passphrase')) {
              credentials.passphrase = value;
            } else if (cleanKey.includes('uid') && !cleanKey.includes('备注')) {
              credentials.uid = value;
            } else if (cleanKey.includes('ip')) {
              credentials.ip = value;
            }
          }
        });
      }

      // Fill the form with parsed values
      if (credentials.apiKey) {
        setValue('okxApiKey', credentials.apiKey);
      }
      if (credentials.secretKey) {
        setValue('okxApiSecret', credentials.secretKey);
      }
      if (credentials.passphrase !== undefined) {
        setValue('okxPassphrase', credentials.passphrase);
      }
      if (credentials.uid) {
        setValue('okxUid', credentials.uid);
      }

      const filledFields = Object.keys(credentials).length;
      if (filledFields > 0) {
        toast.success(`已自动填充 ${filledFields} 个字段`);
        setShowAutoFill(false);
        setPastedCredentials('');
      } else {
        toast.error('未识别到有效的API凭据字段');
      }
    } catch (error) {
      toast.error('解析凭据失败，请检查格式是否正确');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.register({
        Name: data.name.trim(),
        Username: data.email.trim(),
        Password: data.password.trim(),
        OKX_API_KEY: data.okxApiKey.trim(),
        OKX_API_SECRET: data.okxApiSecret.trim(),
        OKX_API_Passphrase: data.okxPassphrase.trim(),
        OKX_UID: data.okxUid.trim(),
      });

      if (response.data?.success) {
        // Clear saved data on successful registration
        localStorage.removeItem('registerFormData');
        setHasSavedData(false);
        setIsSuccess(true);
        toast.success('注册成功！');
      } else if (response.data?.err) {
        // Handle server error response
        handleAPIError(response.data.err);
      } else {
        toast.error(response.data?.message || '注册失败，请稍后重试');
      }
    } catch (error: any) {
      // Handle network or server errors
      if (error.response?.data?.err) {
        handleAPIError(error.response.data.err);
      } else if (error.response?.status === 500) {
        setErrorDetails({
          title: '服务器错误',
          message: '服务器处理请求时发生错误',
          solution: '请稍后重试或联系技术支持'
        });
        setShowErrorModal(true);
      } else if (error.response?.status === 403) {
        setErrorDetails({
          title: '访问被拒绝',
          message: '无法访问API服务器，可能是跨域请求被阻止',
          solution: '请联系管理员配置服务器CORS设置'
        });
        setShowErrorModal(true);
      } else {
        toast.error('网络错误，请检查您的网络连接');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAPIError = (errorMessage: string) => {
    // Parse specific error messages
    if (errorMessage.includes('交易帐户金额') && errorMessage.includes('strconv.ParseFloat')) {
      setErrorDetails({
        title: 'OKX账户验证失败',
        message: '无法获取您的OKX交易账户余额',
        solution: '请确认：\n1. OKX API凭据正确且有效\n2. API权限包含"读取"权限\n3. 交易账户余额不少于1000 USDT\n4. API未过期或被禁用'
      });
      setShowErrorModal(true);
    } else if (errorMessage.includes('insufficient balance')) {
      setErrorDetails({
        title: '余额不足',
        message: '您的OKX交易账户余额不足',
        solution: '注册需要交易账户中有至少1000 USDT余额'
      });
      setShowErrorModal(true);
    } else if (errorMessage.includes('invalid API')) {
      setErrorDetails({
        title: 'API凭据无效',
        message: 'OKX API凭据验证失败',
        solution: '请检查您的API Key、Secret和Passphrase是否正确'
      });
      setShowErrorModal(true);
    } else {
      // Generic error
      setErrorDetails({
        title: '注册失败',
        message: errorMessage,
        solution: '请检查输入信息后重试'
      });
      setShowErrorModal(true);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-indigo-600/20 animate-gradient-xy"></div>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full glass"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            style={{
              width: `${80 + i * 20}px`,
              height: `${80 + i * 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              注册 / 更新
            </h1>
            <p className="text-gray-600 mt-2">需要1000U以上的交易账户，注册成功后可通过充值香火激活</p>
            
            {/* Saved Data Indicator */}
            {hasSavedData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">发现未完成的注册信息</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearSavedData}
                    className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition-colors"
                  >
                    清除
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAutoFill(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Wand2 className="w-4 h-4" />
                快速填充OKX凭据
              </motion.button>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名称 (Name)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('name', {
                    required: '请输入姓名',
                  })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email', {
                    required: '请输入邮箱',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: '请输入有效的邮箱地址',
                    },
                  })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('password', {
                    required: '请输入密码',
                  })}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* OKX API Key Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OKX API Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('okxApiKey', {
                    required: '请输入OKX API Key',
                  })}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.okxApiKey && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.okxApiKey.message}
                </motion.p>
              )}
            </motion.div>

            {/* OKX API Secret Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OKX API Secret
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('okxApiSecret', {
                    required: '请输入OKX API Secret',
                  })}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.okxApiSecret && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.okxApiSecret.message}
                </motion.p>
              )}
            </motion.div>

            {/* OKX Passphrase Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OKX Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('okxPassphrase', {
                    required: '请输入OKX Passphrase',
                  })}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.okxPassphrase && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.okxPassphrase.message}
                </motion.p>
              )}
            </motion.div>

            {/* OKX UID Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OKX UID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('okxUid', {
                    required: '请输入OKX UID',
                  })}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.okxUid && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.okxUid.message}
                </motion.p>
              )}
            </motion.div>


            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  提交中...
                </div>
              ) : (
                '注册 / 更新'
              )}
            </motion.button>
          </form>

        </div>
      </motion.div>

      {/* Auto-fill Modal */}
      <AnimatePresence>
        {showAutoFill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            onClick={() => setShowAutoFill(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">粘贴OKX API凭据</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAutoFill(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    请粘贴您的OKX API凭据信息
                  </label>
                  <textarea
                    value={pastedCredentials}
                    onChange={(e) => setPastedCredentials(e.target.value)}
                    placeholder={`支持两种格式：

【OKX APP格式】
{"apiKey":"d7d2a7c9-4253-4e43-9534-4d8d9824ed00","secretKey":"7EABA694D263A3DE855F1D4028B39500","API name":"a112233","IP":"0","Permissions":"只读, 交易"}

【OKX WEB格式】
apikey = "a9d859af-0b87-40e7-95c6-29f43add7900"
secretkey = "3CF2BE32D1BB7B7C781167A7FEF22800"
IP = ""
备注名 = "b112233"
权限 = "读取/交易"`}
                    className="w-full h-40 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ClipboardPaste className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">支持的格式：</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        <li><strong>OKX App格式：</strong>JSON对象格式（直接复制App中的API信息）</li>
                        <li><strong>OKX Web格式：</strong>键值对格式，使用 = 或 : 分隔</li>
                        <li>自动识别 apiKey, secretKey, passphrase, uid, 备注名 等字段</li>
                        <li>支持带引号或不带引号的值</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAutoFill(false);
                      setPastedCredentials('');
                    }}
                    className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={parseAndFillCredentials}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    自动填充
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <div className="bg-white rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">注册成功！</h2>
              <p className="text-gray-600">正在跳转到登录页面...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && errorDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{errorDetails.title}</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowErrorModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errorDetails.message}</p>
                  </div>

                  {errorDetails.solution && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">解决方案：</p>
                          <p className="text-sm text-blue-800 whitespace-pre-line">{errorDetails.solution}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowErrorModal(false);
                        // Retry registration
                        const form = document.querySelector('form');
                        if (form) form.requestSubmit();
                      }}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      重试
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowErrorModal(false)}
                      className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      关闭
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
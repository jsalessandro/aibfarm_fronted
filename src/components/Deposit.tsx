import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  DollarSign, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Copy,
  Hash,
  HelpCircle,
  Image,
  X,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';

interface DepositFormData {
  username: string;
  password: string;
  referenceCode: string;
  amount: number;
}

const Deposit: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showStepsGuide, setShowStepsGuide] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; title: string; description: string } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState<DepositFormData>({
    username: '',
    password: '',
    referenceCode: '',
    amount: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ACCOUNT_NUMBER = '3733373495422976';
  const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

  // Load saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('depositUsername');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
    }
  }, []);

  // Save username when it changes
  useEffect(() => {
    if (formData.username.trim()) {
      localStorage.setItem('depositUsername', formData.username.trim());
    }
  }, [formData.username]);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER);
    toast.success('账户号码已复制到剪贴板');
  };

  const selectQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    toast.success(`已选择金额: ${amount} USDT`);
  };

  const steps = [
    {
      id: 1,
      title: '复制收款账户',
      description: '点击复制按钮，将收款账户号码复制到剪贴板',
      details: [
        '账户号码：3733373495422976',
        '建议首次使用前先在OKX建立白名单',
        '确保账户号码复制正确'
      ]
    },
    {
      id: 2,
      title: '填写用户信息',
      description: '输入您的用户名和密码，系统会自动记住用户名',
      details: [
        '用户名将被自动保存，下次访问时自动填充',
        '确保密码准确无误',
        '所有信息都会通过SSL加密传输'
      ]
    },
    {
      id: 3,
      title: '设置参考编号',
      description: '输入参考编号，这将用于转账时的备注信息',
      details: [
        '参考编号用于标识您的转账',
        '在OKX转账时请在备注栏填写此编号',
        '点击查看示例了解如何在OKX中操作'
      ]
    },
    {
      id: 4,
      title: '选择充值金额',
      description: '选择或输入充值金额，支持快速选择常用金额',
      details: [
        '可以点击快速选择按钮：100、500、1000、2000、5000 USDT',
        '也可以手动输入自定义金额',
        '确保金额与实际转账金额一致'
      ]
    },
    {
      id: 5,
      title: '在OKX进行转账',
      description: '登录OKX，进行内部转账操作',
      details: [
        '登录您的OKX账户',
        '选择内部转账功能',
        '输入收款账户号码：3733373495422976',
        '选择USDT币种',
        '输入转账金额',
        '在备注栏填写参考编号',
        '确认转账信息后提交'
      ]
    },
    {
      id: 6,
      title: '提交充值申请',
      description: '确认所有信息无误后，提交充值申请',
      details: [
        '系统会显示确认对话框',
        '请仔细核对用户名、参考编号和金额',
        '确认无误后点击提交',
        '提交成功后会收到确认通知'
      ]
    }
  ];


  const showImagePreview = (type: 'reference' | 'amount') => {
    const imageData = {
      reference: {
        src: 'https://aibfarm.com/assets/images/notes/okx_deposit_with_notes.png',
        title: '参考编号填写示例',
        description: '在转账时在备注页面写入此参考编号'
      },
      amount: {
        src: 'https://aibfarm.com/assets/images/notes/okx_deposit_with_notes.png',
        title: '金额填写示例',
        description: '在OKX内部转账时在金额页面中USDT对应账户提币数量'
      }
    };
    
    setModalImage(imageData[type]);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImage(null);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, imageZoom + delta));
    setImageZoom(newZoom);
  };

  const resetImageView = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleInputChange = (field: keyof DepositFormData, value: string | number) => {
    if (field === 'amount') {
      setFormData(prev => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: String(value) }));
    }
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = '请输入用户名';
    if (!formData.password.trim()) newErrors.password = '请输入密码';
    if (!formData.referenceCode.trim()) newErrors.referenceCode = '请输入参考编号';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = '请输入有效金额';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      const response = await api.deposit({
        username: formData.username.trim(),
        password: formData.password.trim(),
        referenceCode: formData.referenceCode.trim(),
        amount: formData.amount,
      });

      if (response.data?.success) {
        setShowSuccess(true);
        toast.success('充值成功！');
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        toast.error(response.data?.message || '充值失败，请稍后重试');
      }
    } catch (error) {
      toast.error('网络错误，请检查您的网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            initial={{ y: '100vh', x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) }}
            animate={{
              y: '-100vh',
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 15}%`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <DollarSign className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              💰 充值
            </h1>
            <p className="text-gray-600 mt-2">充值平台：OKX</p>
            
            {/* Steps Guide Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStepsGuide(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 mx-auto hover:shadow-lg transition-all"
            >
              <Info className="w-4 h-4" />
              查看充值步骤指引
            </motion.button>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">账户号码：{ACCOUNT_NUMBER}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyAccountNumber}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
              >
                <Copy className="w-4 h-4" />
                复制账户号码
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-2">首次使用建议先建立白名单</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
                {localStorage.getItem('depositUsername') && (
                  <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    已记住
                  </span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder=""
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Reference Code Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  参考编号
                </label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showImagePreview('reference')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors"
                >
                  <Image className="w-3 h-3" />
                  查看示例
                </motion.button>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.referenceCode}
                  onChange={(e) => handleInputChange('referenceCode', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder=""
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => showImagePreview('reference')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                >
                  <HelpCircle className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">💡 操作提示：转账备注中写入此参考编号</p>
                <p className="text-xs text-gray-500 mt-1">点击右侧图标查看详细示例图片（支持放大查看）</p>
              </div>
              {errors.referenceCode && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.referenceCode}
                </motion.p>
              )}
            </motion.div>

            {/* Amount Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  金额
                </label>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showImagePreview('amount')}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-full transition-colors"
                >
                  <Image className="w-3 h-3" />
                  查看示例
                </motion.button>
              </div>
              
              {/* Quick Amount Selection */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">快速选择：</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <motion.button
                      key={amount}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectQuickAmount(amount)}
                      className={`px-3 py-1 text-xs rounded-full transition-all ${
                        formData.amount === amount
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {amount} USDT
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder=""
                  min="0"
                  step="0.01"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => showImagePreview('amount')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                >
                  <HelpCircle className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">💰 金额提示：在OKX页面选择USDT对应账户</p>
                <p className="text-xs text-gray-500 mt-1">点击右侧图标查看详细示例图片（支持放大查看）</p>
              </div>
              {errors.amount && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.amount}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  '提交'
                )}
              </span>
            </motion.button>

            {/* Security Note */}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 justify-center">
              <Shield className="w-4 h-4 text-green-500" />
              <span>您的支付信息将通过256位SSL加密传输</span>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">{modalImage.title}</h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      disabled={imageZoom <= 0.5}
                      className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ZoomOut className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <span className="text-sm text-gray-500 min-w-[60px] text-center">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      disabled={imageZoom >= 3}
                      className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={resetImageView}
                      className="p-1 hover:bg-gray-100 rounded-full text-xs px-2"
                    >
                      重置
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeImageModal}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🖼️ 操作示例图片</span>
                    <span className="text-xs text-gray-500">点击图片放大 • 滚轮缩放 • 拖拽查看</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl overflow-hidden relative">
                    <div
                      className="relative select-none"
                      style={{ 
                        height: '500px',
                        cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                      }}
                      onWheel={handleWheel}
                    >
                    <img 
                      src={modalImage.src} 
                      alt={modalImage.title}
                      className="w-full h-full object-contain select-none"
                      style={{
                        transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        willChange: 'transform'
                      }}
                      onClick={() => {
                        if (imageZoom === 1) {
                          setImageZoom(2);
                        } else {
                          resetImageView();
                        }
                      }}
                      onMouseDown={(e) => {
                        if (imageZoom > 1) {
                          e.preventDefault();
                          setIsDragging(true);
                          setDragStart({
                            x: e.clientX - imagePosition.x,
                            y: e.clientY - imagePosition.y
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (isDragging && imageZoom > 1) {
                          setImagePosition({
                            x: e.clientX - dragStart.x,
                            y: e.clientY - dragStart.y
                          });
                        }
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      draggable={false}
                    />
                    

                    {/* Zoom Level Indicator */}
                    {imageZoom > 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {Math.round(imageZoom * 100)}%
                      </motion.div>
                    )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{modalImage.description}</p>
                  </div>
                  {modalImage.title.includes('参考编号') && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">操作步骤：</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>登录 OKX 账户</li>
                          <li>进入内部转账页面</li>
                          <li>在备注栏填写此参考编号</li>
                          <li>确认转账信息无误后提交</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  {modalImage.title.includes('金额') && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">金额确认：</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>确保转账金额与此处填写金额一致</li>
                          <li>检查账户余额是否充足</li>
                          <li>注意手续费可能会影响实际到账金额</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeImageModal}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                >
                  我知道了
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps Guide Modal */}
      <AnimatePresence>
        {showStepsGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            onClick={() => {
              setShowStepsGuide(false);
              setSelectedStep(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">充值步骤指引</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowStepsGuide(false);
                      setSelectedStep(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <motion.div
                      key={step.id}
                      className={`border-2 rounded-xl transition-all cursor-pointer ${
                        selectedStep === step.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              selectedStep === step.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {step.id}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{step.title}</h4>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform ${
                            selectedStep === step.id ? 'rotate-90 text-blue-500' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        <AnimatePresence>
                          {selectedStep === step.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <ul className="space-y-2">
                                {step.details.map((detail, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowStepsGuide(false);
                    setSelectedStep(null);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                >
                  我知道了
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">确认充值信息</h3>
                <p className="text-sm text-gray-600">请确认以下信息无误后提交</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">用户名</span>
                  <span className="text-sm font-medium text-gray-800">{formData.username}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">参考编号</span>
                  <span className="text-sm font-medium text-gray-800">{formData.referenceCode}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">充值金额</span>
                  <span className="text-lg font-bold text-green-600">{formData.amount} USDT</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  再次确认
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmSubmit}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      提交中...
                    </div>
                  ) : (
                    '确认提交'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 text-center max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">充值成功！</h2>
              <p className="text-gray-600 mb-4">
                您已成功提交充值申请
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSuccess(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
              >
                确定
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deposit;
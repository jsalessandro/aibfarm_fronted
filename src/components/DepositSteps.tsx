import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Monitor, Smartphone, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';

const DepositSteps: React.FC = () => {
  const [platform, setPlatform] = useState<'web' | 'app'>('web');
  const [currentStep, setCurrentStep] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const webSteps = [
    { image: '/deposit-steps/web/1.jpg', title: '步骤 1', description: '打开充值页面' },
    { image: '/deposit-steps/web/2.jpg', title: '步骤 2', description: '选择充值方式' },
    { image: '/deposit-steps/web/3.jpg', title: '步骤 3', description: '填写充值信息' },
    { image: '/deposit-steps/web/4.jpg', title: '步骤 4', description: '确认充值金额' },
    { image: '/deposit-steps/web/5.jpg', title: '步骤 5', description: '提交充值申请' },
    { image: '/deposit-steps/web/6.png', title: '步骤 6', description: '等待处理' },
    { image: '/deposit-steps/web/7.jpg', title: '步骤 7', description: '完成充值' },
  ];

  const appSteps = [
    { image: '/deposit-steps/app/1.jpg', title: '步骤 1', description: '打开应用' },
    { image: '/deposit-steps/app/2.jpg', title: '步骤 2', description: '进入充值' },
    { image: '/deposit-steps/app/3.jpg', title: '步骤 3', description: '选择金额' },
    { image: '/deposit-steps/app/4.jpg', title: '步骤 4', description: '填写信息' },
    { image: '/deposit-steps/app/5.jpg', title: '步骤 5', description: '确认充值' },
    { image: '/deposit-steps/app/6.jpg', title: '步骤 6', description: '等待处理' },
    { image: '/deposit-steps/app/7.jpg', title: '步骤 7', description: '完成充值' },
  ];

  const steps = platform === 'web' ? webSteps : appSteps;

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
  };

  const handlePlatformChange = (newPlatform: 'web' | 'app') => {
    setPlatform(newPlatform);
    setCurrentStep(0);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageClick = () => {
    setIsZoomed(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle ESC key to close zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        handleCloseZoom();
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when zoomed
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              充值香火步骤
            </h1>
            <div className="w-24"></div>
          </div>

          {/* Platform Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlatformChange('web')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                platform === 'web'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span>在 Web 上</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlatformChange('app')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                platform === 'app'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span>在 App 上</span>
            </motion.button>
          </div>

          {/* Steps Display */}
          <div className="relative">
            {/* Image Carousel */}
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-6" style={{ minHeight: '500px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${platform}-${currentStep}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center p-8"
                >
                  <div className="relative group">
                    <img
                      src={steps[currentStep].image}
                      alt={steps[currentStep].title}
                      className="max-w-full max-h-[500px] object-contain rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                      onClick={handleImageClick}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'text-gray-500 text-center';
                          errorDiv.textContent = '图片加载中...';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>点击查看大图</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-lg text-gray-600">{steps[currentStep].description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {steps.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Step Counter */}
            <div className="text-center text-gray-600 mb-8">
              <span className="text-lg font-semibold">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Link to="/deposit">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  立即充值
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseZoom();
              }
            }}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={scale <= 1}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="缩小"
              >
                <ZoomOut className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={scale >= 3}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="放大"
              >
                <ZoomIn className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                title="重置"
              >
                <Maximize2 className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseZoom();
                }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                title="关闭"
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg z-50 pointer-events-none">
              <span className="text-white font-semibold">{Math.round(scale * 100)}%</span>
            </div>

            {/* Image */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <motion.img
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  scale: scale,
                  x: position.x,
                  y: position.y,
                }}
                drag={scale > 1}
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  setPosition({
                    x: position.x + info.offset.x,
                    y: position.y + info.offset.y,
                  });
                }}
              />
            </motion.div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg z-50 pointer-events-none">
              <p className="text-white text-sm">
                {scale > 1 ? '拖动图片查看细节 | 滚轮或按钮缩放' : '使用按钮放大图片 | 点击空白处或按 ESC 关闭'}
              </p>
            </div>

            {/* Navigation in Zoom Mode */}
            {steps.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                    handleResetZoom();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-50"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                    handleResetZoom();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-50"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepositSteps;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, DollarSign, Shield, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
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
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12">
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-10"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl font-bold">AI</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
              AIBFARM
            </h1>
            <p className="text-xl text-gray-600">智能金融平台</p>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50"
            >
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">安全可靠</h3>
              <p className="text-sm text-gray-600">采用先进的加密技术保护您的资产安全</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-indigo-50"
            >
              <Sparkles className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">智能交易</h3>
              <p className="text-sm text-gray-600">AI驱动的智能交易系统，优化您的投资策略</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50"
            >
              <DollarSign className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">收益稳定</h3>
              <p className="text-sm text-gray-600">专业的风险控制，追求稳定的投资回报</p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/?/register"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span>注册 / 更新</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/?/deposit"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <DollarSign className="w-5 h-5" />
                <span>充值香火</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-10 pt-8 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500">
              需要1000U以上的交易账户，注册成功后可通过充值香火激活
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
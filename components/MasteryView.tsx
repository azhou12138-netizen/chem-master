import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface MasteryViewProps {
  score: number;
  questionsAnswered: number;
  onContinue: () => void;
  onRestart: () => void;
}

const MasteryView: React.FC<MasteryViewProps> = ({ score, questionsAnswered, onContinue, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative bg-gradient-to-tr from-yellow-300 to-yellow-500 p-8 rounded-full shadow-2xl border-4 border-white/50">
          <Trophy size={80} className="text-white drop-shadow-md" />
        </div>
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="absolute -top-2 -right-2 bg-red-500 text-white font-bold px-3 py-1 rounded-full border-2 border-white shadow-lg rotate-12"
        >
          Level 4
        </motion.div>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-black text-slate-800 mb-4"
      >
        达成学业质量水平 4！
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-slate-600 mb-10 max-w-md"
      >
        您在“硫与二氧化硫”单元展现了卓越的综合探究能力，能够解决复杂的化学问题。
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12"
      >
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">最终得分</span>
          <span className="text-3xl font-black text-blue-600">{score}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">答题数量</span>
          <span className="text-3xl font-black text-indigo-600">{questionsAnswered}</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
      >
        <button 
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <RotateCcw size={20} />
          完成并退出
        </button>
        <button 
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1 transition-all"
        >
          继续刷题
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default MasteryView;
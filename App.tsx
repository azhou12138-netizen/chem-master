
import React, { useState } from 'react';
import { AppState, DifficultyLevel, UserProgress, MistakeRecord, Competency } from './types';
import Assessment from './components/Assessment';
import QuizView from './components/QuizView';
import MasteryView from './components/MasteryView';
import MistakeBook from './components/MistakeBook';
import { Atom, Zap, Microscope, Scale, HeartHandshake, Sparkles, BookX, ArrowRight, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [initialLevel, setInitialLevel] = useState<DifficultyLevel>(DifficultyLevel.Level1);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  const handleAssessmentComplete = (level: DifficultyLevel) => {
    setInitialLevel(level);
    setAppState(AppState.LEARNING);
  };

  const handleMastery = (userProgress: UserProgress) => {
    setProgress(userProgress);
    setAppState(AppState.MASTERY);
  };

  const handleRestart = () => {
    setAppState(AppState.LEARNING);
    setInitialLevel(DifficultyLevel.Level1);
  };

  const handleAddMistake = (record: MistakeRecord) => {
    setMistakes(prev => {
      // Avoid duplicates
      if (prev.some(r => r.question.id === record.question.id)) return prev;
      return [record, ...prev];
    });
  };

  // 5 Parallel Core Competencies
  const competencies = [
    { name: "宏观辨识与微观探析", icon: <Atom size={24} />, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "变化观念与平衡思想", icon: <Zap size={24} />, color: "text-yellow-500", bg: "bg-yellow-50" },
    { name: "证据推理与模型认知", icon: <Scale size={24} />, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "科学探究与创新意识", icon: <Microscope size={24} />, color: "text-green-500", bg: "bg-green-50" },
    { name: "科学态度与社会责任", icon: <HeartHandshake size={24} />, color: "text-red-500", bg: "bg-red-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-yellow-200/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-indigo-200/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <div 
          onClick={() => setAppState(AppState.WELCOME)}
          className="flex items-center gap-2 pointer-events-auto bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all hover:bg-white/80 group"
        >
          <div className="bg-yellow-400 p-1.5 rounded-lg text-white group-hover:bg-yellow-500 transition-colors">
            <Hexagon size={20} fill="currentColor" className="animate-spin-slow" />
          </div>
          <span className="font-black text-slate-800 tracking-tight">ChemMaster</span>
        </div>
        
        {appState !== AppState.WELCOME && (
          <button 
            onClick={() => setAppState(AppState.MISTAKE_BOOK)}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-600 group"
          >
            <BookX size={18} className="text-slate-400 group-hover:text-red-500 transition-colors"/>
            <span className="hidden sm:inline">错题本</span>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs min-w-[20px] text-center">
              {mistakes.length}
            </span>
          </button>
        )}
      </header>

      <main className="container mx-auto px-4 py-24 relative z-10 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {appState === AppState.WELCOME && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Animated Floating Elements */}
              <div className="relative h-20 mb-8 flex justify-center items-center">
                 <Atom size={48} className="absolute text-blue-400 animate-float left-1/3 top-0 opacity-50" />
                 <Zap size={40} className="absolute text-yellow-400 animate-float left-1/2 top-4 opacity-80" style={{ animationDelay: '1s' }} />
                 <Sparkles size={36} className="absolute text-purple-400 animate-float left-2/3 top-2 opacity-60" style={{ animationDelay: '2s' }} />
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                人教版必修二<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
                  第五章第一节 硫及其化合物
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                全网首创·基于课程标准化学业质量水平的自适应题库。<br/>
                覆盖 <span className="font-bold text-slate-800">硫单质 · 二氧化硫 · 环保与转化</span> 核心知识点。
              </p>

              {/* 5 Competencies Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-16 text-left">
                {competencies.map((comp, i) => (
                   <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}
                   >
                      <div className={`p-3 rounded-xl ${comp.bg} ${comp.color}`}>
                        {comp.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-600 leading-tight">
                        {comp.name}
                      </span>
                   </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setAppState(AppState.ASSESSMENT)}
                  className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-300 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center gap-3 group"
                >
                  <Sparkles size={20} className="group-hover:animate-spin-slow" />
                  开始智能诊断
                </button>
                <button
                   onClick={() => setAppState(AppState.MISTAKE_BOOK)}
                   className="px-10 py-5 bg-white text-slate-600 rounded-full font-bold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-3"
                >
                   <BookX size={20} />
                   我的错题本
                   {mistakes.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{mistakes.length}</span>}
                </button>
              </div>

            </motion.div>
          )}

          {appState === AppState.ASSESSMENT && (
            <motion.div
               key="assessment"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <Assessment onComplete={handleAssessmentComplete} />
            </motion.div>
          )}

          {appState === AppState.LEARNING && (
            <motion.div
               key="learning"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <QuizView 
                 initialLevel={initialLevel} 
                 onRestart={handleRestart} 
                 onMastery={handleMastery}
                 onAddMistake={handleAddMistake}
               />
            </motion.div>
          )}

          {appState === AppState.MASTERY && progress && (
            <motion.div
               key="mastery"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <MasteryView 
                 score={progress.score} 
                 questionsAnswered={progress.questionsAnswered}
                 onContinue={handleRestart} // Or just loop
                 onRestart={handleRestart}
               />
            </motion.div>
          )}

          {appState === AppState.MISTAKE_BOOK && (
            <motion.div
               key="mistake"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <MistakeBook 
                 mistakes={mistakes} 
                 onBack={() => setAppState(AppState.WELCOME)} 
               />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { DifficultyLevel, Question, UserProgress, MistakeRecord } from '../types';
import { STATIC_QUESTIONS } from '../data/questionBank';
import { Award, AlertCircle, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle, BookOpen, Layers, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizViewProps {
  initialLevel: DifficultyLevel;
  onRestart: () => void;
  onMastery: (progress: UserProgress) => void;
  onAddMistake: (record: MistakeRecord) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ initialLevel, onRestart, onMastery, onAddMistake }) => {
  // Global Progress State
  const [currentLevel, setCurrentLevel] = useState<DifficultyLevel>(initialLevel);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  // Queue State for Current Level
  const [queue, setQueue] = useState<Question[]>([]);
  const [retryQueue, setRetryQueue] = useState<Question[]>([]); // Questions answered wrong, to be retried
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // UI State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false); // Are we currently clearing the retry queue?

  const levelInfo: Record<number, { title: string; subtitle: string }> = {
    1: { title: "水平一", subtitle: "基础识记与现象描述能力" },
    2: { title: "水平二", subtitle: "规律理解与微观分析能力" },
    3: { title: "水平三", subtitle: "证据推理与模型应用能力" },
    4: { title: "水平四", subtitle: "综合评价与复杂决策能力" }
  };

  const formatChemText = (text: string): string => {
    if (!text) return "";
    let formatted = text;
    formatted = formatted.replace(/\s=\s/g, "<span class='chem-op'>=</span>");
    formatted = formatted.replace(/\s\+\s/g, "<span class='chem-op'>+</span>");
    formatted = formatted.replace(/==/g, "<span class='chem-op'>⇌</span>"); 
    formatted = formatted.replace(/\s⇌\s/g, "<span class='chem-op'>⇌</span>");
    formatted = formatted.replace(/ (\d*[+-])(?=[\s.,;)]|$)/g, "<sup>$1</sup>");
    formatted = formatted.replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
    return formatted;
  };

  // Initialize Queue when Level changes
  useEffect(() => {
    // 1. Get all questions for this level
    const questions = STATIC_QUESTIONS.filter(q => q.difficultyLevel === currentLevel);
    // 2. Shuffle them
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    setQueue(shuffled);
    setRetryQueue([]);
    setIsRetryMode(false);
    
    if (shuffled.length > 0) {
      setCurrentQuestion(shuffled[0]);
    } else {
      // Handle case with no questions for level (should not happen with full bank)
      console.warn("No questions found for level " + currentLevel);
    }
  }, [currentLevel]);

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;
    setIsSubmitted(true);
    
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

    // Update Score
    if (isCorrect) {
      setScore(prev => prev + 10 * currentLevel);
    }
    setTotalAnswered(prev => prev + 1);

    // If Wrong: Add to MistakeBook and RetryQueue
    if (!isCorrect) {
      const record: MistakeRecord = {
        question: currentQuestion,
        timestamp: Date.now(),
        userWrongAnswerIndex: selectedOption
      };
      onAddMistake(record);

      // Only add to retry queue if it's not already there
      if (!retryQueue.find(q => q.id === currentQuestion.id)) {
        setRetryQueue(prev => [...prev, currentQuestion]);
      }
    }
  };

  const handleNext = async () => {
    // Reset UI
    setIsSubmitted(false);
    setSelectedOption(null);

    // Queue Logic
    let nextQueue = [...queue];
    let nextRetryQueue = [...retryQueue];
    
    if (!isRetryMode) {
      // We were doing new questions. Remove the head.
      nextQueue.shift(); 
    } else {
      // We were doing retries. 
      const justFinished = nextRetryQueue.shift();
      // If wrong again, push back to end of retry queue to cycle until correct
      if (selectedOption !== currentQuestion?.correctOptionIndex && justFinished) {
         nextRetryQueue.push(justFinished);
      }
    }

    setQueue(nextQueue);
    setRetryQueue(nextRetryQueue);

    // Check availability
    if (nextQueue.length > 0) {
      // Still have new questions
      setCurrentQuestion(nextQueue[0]);
    } else if (nextRetryQueue.length > 0) {
      // No new questions, but have retries
      setIsRetryMode(true);
      setCurrentQuestion(nextRetryQueue[0]);
    } else {
      // Both queues empty. All done!
      handleLevelComplete();
    }
  };

  const handleLevelComplete = () => {
     const newCompleted = [...completedLevels];
     if (!newCompleted.includes(currentLevel)) {
       newCompleted.push(currentLevel);
     }
     setCompletedLevels(newCompleted);

     if (currentLevel < 4) {
       setCurrentLevel((currentLevel + 1) as DifficultyLevel);
     } else {
       onMastery({
         currentLevel,
         streak: 0,
         score,
         questionsAnswered: totalAnswered
       });
     }
  };
  
  const remainingCount = queue.length + retryQueue.length - (isSubmitted ? 1 : 0); 

  if (!currentQuestion) return <div className="p-10 text-center text-slate-500">正在加载试题...</div>;

  const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Level Header */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-yellow-200/50">
             {currentLevel}
           </div>
           <div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">{levelInfo[currentLevel].title}</h2>
             <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
               <Layers size={14} className="text-blue-500"/>
               {levelInfo[currentLevel].subtitle}
             </div>
           </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-3">
           {isRetryMode && (
             <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100 animate-pulse shadow-sm">
               <RotateCcw size={14} /> 错题重练模式
             </div>
           )}
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
             剩余: {remainingCount > 0 ? remainingCount : 0}
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
             积分: {score}
           </div>
           
           <button 
             onClick={handleLevelComplete}
             className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm"
           >
             完成本级
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion.id + (isRetryMode ? '_retry' : '')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 ring-1 ring-slate-50"
        >
          {/* Question Area */}
          <div className="p-8 md:p-12 bg-gradient-to-b from-white to-slate-50/80 relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-100/50 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="flex flex-wrap items-center gap-2 mb-6 relative z-10">
                <span className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                  {currentQuestion.topicTag}
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {currentQuestion.competency}
                </span>
             </div>
             
             <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug tracking-tight relative z-10"
                 dangerouslySetInnerHTML={{ __html: formatChemText(currentQuestion.questionText) }}
             />

             {/* 图片展示区域 */}
             {currentQuestion.imageUrl && (
               <div className="mt-8 mb-4 flex justify-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative z-10">
                 <img 
                   src={currentQuestion.imageUrl} 
                   alt="实验装置图" 
                   className="max-h-64 md:max-h-80 object-contain rounded-lg"
                 />
               </div>
             )}
          </div>

          {/* Options Area */}
          <div className="p-8 md:p-12 pt-0 space-y-4">
             {currentQuestion.options.map((option, idx) => {
                let style = "bg-white border-slate-200 text-slate-600 hover:border-yellow-400 hover:bg-yellow-50/50 hover:shadow-md";
                let icon = null;
                const letter = String.fromCharCode(65 + idx);

                if (isSubmitted) {
                   if (idx === currentQuestion.correctOptionIndex) {
                      style = "bg-green-50 border-green-500 text-white shadow-lg shadow-green-200 scale-[1.01]";
                      icon = <CheckCircle2 className="text-white" size={22} />;
                   } else if (idx === selectedOption) {
                      style = "bg-red-50 border-red-200 text-red-800";
                      icon = <AlertCircle className="text-red-500" size={22} />;
                   } else {
                      style = "bg-slate-50 border-slate-100 text-slate-300 opacity-60";
                   }
                } else if (selectedOption === idx) {
                   style = "bg-slate-800 border-slate-800 text-white shadow-lg ring-4 ring-slate-100";
                }

                return (
                   <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-5 rounded-2xl border-[1.5px] transition-all duration-200 flex items-center justify-between group ${style}`}
                   >
                      <div className="flex items-center gap-5">
                         <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black 
                            ${isSubmitted && idx === currentQuestion.correctOptionIndex ? 'bg-white/20 text-white' : (selectedOption === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}
                         `}>{letter}</span>
                         <span className="font-medium text-lg" dangerouslySetInnerHTML={{ __html: formatChemText(option) }} />
                      </div>
                      {icon}
                   </button>
                )
             })}
          </div>

          {/* Feedback Area */}
          {isSubmitted && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               className={`border-t ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}
             >
                <div className="p-8 md:p-12">
                   <div className="flex items-center gap-3 mb-6">
                      {isCorrect ? <Award className="text-green-600" size={32}/> : <AlertCircle className="text-red-600" size={32}/>}
                      <h3 className={`text-2xl font-black ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                         {isCorrect ? "回答正确" : "回答错误"}
                      </h3>
                   </div>

                   <div className="prose prose-lg max-w-none text-slate-700 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
                      <p className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={12}/> 核心解析
                      </p>
                      <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatChemText(currentQuestion.explanation) }} />
                   </div>

                   {!isCorrect && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         {currentQuestion.misconception && (
                            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 text-orange-900 shadow-sm">
                               <div className="font-bold text-xs uppercase mb-2 flex items-center gap-2 text-orange-700">
                                 <AlertTriangle size={14}/> 诊断分析
                               </div>
                               <p className="text-sm leading-relaxed">{currentQuestion.misconception}</p>
                            </div>
                         )}
                         {currentQuestion.learningTip && (
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-900 shadow-sm">
                               <div className="font-bold text-xs uppercase mb-2 flex items-center gap-2 text-blue-700">
                                 <BookOpen size={14}/> 学习指引
                               </div>
                               <p className="text-sm leading-relaxed">{currentQuestion.learningTip}</p>
                            </div>
                         )}
                      </div>
                   )}

                   <div className="flex justify-end">
                      <button
                         onClick={handleNext}
                         className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center gap-3 text-lg"
                      >
                         {remainingCount <= 0 && isCorrect ? "完成本级" : "下一题"} <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
             </motion.div>
          )}

          {/* Submit Action */}
          {!isSubmitted && (
             <div className="p-8 md:p-12 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                   onClick={handleSubmit}
                   disabled={selectedOption === null}
                   className={`px-12 py-4 rounded-full font-bold shadow-lg transition-all text-lg ${
                      selectedOption !== null 
                      ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 hover:shadow-yellow-200 hover:-translate-y-1' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   }`}
                >
                   提交答案
                </button>
             </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizView;


import React, { useState, useEffect } from 'react';
import { getAssessmentQuestions } from '../services/geminiService';
import { DifficultyLevel } from '../types';

interface AssessmentProps {
  onComplete: (startingLevel: DifficultyLevel) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<{ text: string; level: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track confidence per level: [level]: count of "Yes"
  const [levelConfidence, setLevelConfidence] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [levelTotal, setLevelTotal] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  useEffect(() => {
    const fetchQs = async () => {
      const data = await getAssessmentQuestions();
      // Sort by level
      const sorted = data.questions.sort((a, b) => a.level - b.level);
      setQuestions(sorted);
      
      // Calculate totals per level
      const totals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
      sorted.forEach(q => {
        totals[q.level] = (totals[q.level] || 0) + 1;
      });
      setLevelTotal(totals);
      
      setLoading(false);
    };
    fetchQs();
  }, []);

  const handleAnswer = (isYes: boolean) => {
    const currentQ = questions[currentIndex];
    
    if (isYes) {
      setLevelConfidence(prev => ({
        ...prev,
        [currentQ.level]: prev[currentQ.level] + 1
      }));
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      calculateAndFinish(isYes); // Pass last answer to be included in state closure if needed, though we rely on state
    }
  };

  const calculateAndFinish = (lastIsYes: boolean) => {
    // We need to include the last answer in the calculation. 
    // Since setState is async, let's calculate locally.
    const currentQ = questions[currentIndex];
    const finalConfidence = { ...levelConfidence };
    if (lastIsYes) {
      finalConfidence[currentQ.level] = (finalConfidence[currentQ.level] || 0) + 1;
    }

    let recommendedLevel = 1;

    // Logic: 
    // Check Level 1: If user mastered nearly all (e.g. 100% or > 50%), check Level 2.
    // Else, Start at 1.
    // Continue until user fails a level.
    
    // Check Level 1
    const l1Pass = finalConfidence[1] === levelTotal[1]; // Require 100% for Level 1 basics
    if (l1Pass) {
       recommendedLevel = 2;
       
       // Check Level 2
       const l2Pass = finalConfidence[2] >= Math.ceil(levelTotal[2] * 0.66); // Require ~66% for L2
       if (l2Pass) {
         recommendedLevel = 3;
         
         // Check Level 3
         const l3Pass = finalConfidence[3] >= Math.ceil(levelTotal[3] * 0.66);
         if (l3Pass) {
           recommendedLevel = 4;
           
           // Check Level 4 - if they know even L4, they are Mastery? 
           // Let's cap at 4 to let them practice the hardest ones.
         }
       }
    }

    onComplete(recommendedLevel as DifficultyLevel);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse">正在生成个性化诊断问卷...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;
  
  const levelLabels = {
    1: "L1 基础识记",
    2: "L2 规律理解",
    3: "L3 迁移推断",
    4: "L4 综合探究"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
      
      <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">学业质量水平前测</h2>
      
      <div className="w-full bg-slate-100 rounded-full h-3 mb-10 overflow-hidden">
        <div className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="mb-12 text-center relative z-10">
        <div className="inline-block px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg mb-6 border border-slate-200 uppercase tracking-widest">
           {levelLabels[currentQ.level as keyof typeof levelLabels]}
        </div>
        <h3 className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed">
          {currentQ.text}
        </h3>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 max-w-[200px] py-4 px-6 rounded-2xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-lg"
        >
          否 / 不确定
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 max-w-[200px] py-4 px-6 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-300 hover:bg-slate-800 hover:-translate-y-1 transition-all font-bold text-lg"
        >
          是 / 能做到
        </button>
      </div>
      
      <p className="text-center text-slate-400 text-xs mt-8">
         题目 {currentIndex + 1} / {questions.length}
      </p>
    </div>
  );
};

export default Assessment;


import React, { useState, useEffect } from 'react';
import { getAssessmentQuestions } from '../services/geminiService';
import { DifficultyLevel, Competency } from '../types';
import { Atom, Zap, Microscope, Scale, HeartHandshake } from 'lucide-react';

interface AssessmentProps {
  onComplete: (startingLevel: DifficultyLevel) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<{ text: string; competency: Competency }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track confidence per Competency
  const [competencyScores, setCompetencyScores] = useState<Record<Competency, number>>({
    [Competency.MacroMicro]: 0,
    [Competency.ChangeBalance]: 0,
    [Competency.EvidenceModel]: 0,
    [Competency.InquiryInnovation]: 0,
    [Competency.AttitudeResponsibility]: 0
  });

  useEffect(() => {
    const fetchQs = async () => {
      const data = await getAssessmentQuestions();
      // Shuffle questions to mix competencies
      const shuffled = data.questions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setLoading(false);
    };
    fetchQs();
  }, []);

  const formatChemText = (text: string): string => {
    if (!text) return "";
    let formatted = text;
    // 替换运算符
    formatted = formatted.replace(/\s=\s/g, "<span class='chem-op'>=</span>");
    formatted = formatted.replace(/\s\+\s/g, "<span class='chem-op'>+</span>");
    formatted = formatted.replace(/==/g, "<span class='chem-op'>⇌</span>"); 
    formatted = formatted.replace(/\s⇌\s/g, "<span class='chem-op'>⇌</span>");
    // 替换离子电荷 (例如 2-)
    formatted = formatted.replace(/ (\d*[+-])(?=[\s.,;)]|$)/g, "<sup>$1</sup>");
    // 替换分子式角标 (例如 SO2 -> SO<sub>2</sub>, Ba(NO3)2 -> Ba(NO<sub>3</sub>)<sub>2</sub>)
    formatted = formatted.replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
    return formatted;
  };

  const handleAnswer = (isYes: boolean) => {
    const currentQ = questions[currentIndex];
    
    if (isYes) {
      setCompetencyScores(prev => ({
        ...prev,
        [currentQ.competency]: (prev[currentQ.competency] || 0) + 1
      }));
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      calculateAndFinish(isYes, currentQ.competency);
    }
  };

  const calculateAndFinish = (lastIsYes: boolean, lastComp: Competency) => {
    const finalScores = { ...competencyScores };
    if (lastIsYes) {
      finalScores[lastComp] = (finalScores[lastComp] || 0) + 1;
    }

    let recommendedLevel = DifficultyLevel.Level4;

    const totalPerComp = questions.filter(q => q.competency === Competency.MacroMicro).length || 2;
    const threshold = totalPerComp * 0.5;

    if (finalScores[Competency.MacroMicro] < threshold) {
      recommendedLevel = DifficultyLevel.Level1;
    }
    else if (finalScores[Competency.ChangeBalance] < threshold) {
      recommendedLevel = DifficultyLevel.Level2;
    }
    else if (finalScores[Competency.EvidenceModel] < threshold || finalScores[Competency.InquiryInnovation] < threshold) {
      recommendedLevel = DifficultyLevel.Level3;
    }
    else if (finalScores[Competency.AttitudeResponsibility] < threshold) {
      recommendedLevel = DifficultyLevel.Level4;
    }

    setTimeout(() => {
      onComplete(recommendedLevel);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse">正在构建核心素养诊断模型...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  const compIcons = {
    [Competency.MacroMicro]: <Atom size={18} />,
    [Competency.ChangeBalance]: <Zap size={18} />,
    [Competency.EvidenceModel]: <Scale size={18} />,
    [Competency.InquiryInnovation]: <Microscope size={18} />,
    [Competency.AttitudeResponsibility]: <HeartHandshake size={18} />
  };

  const compColors = {
    [Competency.MacroMicro]: "text-blue-600 bg-blue-50 border-blue-200",
    [Competency.ChangeBalance]: "text-yellow-600 bg-yellow-50 border-yellow-200",
    [Competency.EvidenceModel]: "text-purple-600 bg-purple-50 border-purple-200",
    [Competency.InquiryInnovation]: "text-green-600 bg-green-50 border-green-200",
    [Competency.AttitudeResponsibility]: "text-red-600 bg-red-50 border-red-200"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">核心素养诊断</h2>
      <p className="text-slate-500 text-center mb-8 text-sm">通过自评，精准定位您的化学学科能力维度</p>
      
      <div className="w-full bg-slate-100 rounded-full h-2 mb-10 overflow-hidden">
        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="mb-12 text-center relative z-10 min-h-[160px] flex flex-col items-center justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full mb-6 border uppercase tracking-wide transition-colors duration-300 ${compColors[currentQ.competency]}`}>
           {compIcons[currentQ.competency]}
           {currentQ.competency}
        </div>
        <h3 
          className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatChemText(currentQ.text) }}
        />
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
          className="flex-1 max-w-[200px] py-4 px-6 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all font-bold text-lg"
        >
          是 / 能做到
        </button>
      </div>
      
      <p className="text-center text-slate-400 text-xs mt-8">
         诊断进度 {currentIndex + 1} / {questions.length}
      </p>
    </div>
  );
};

export default Assessment;

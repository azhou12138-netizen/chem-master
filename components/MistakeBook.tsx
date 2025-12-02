
import React, { useState } from 'react';
import { MistakeRecord } from '../types';
import { BookX, ArrowLeft, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MistakeBookProps {
  mistakes: MistakeRecord[];
  onBack: () => void;
}

const MistakeBook: React.FC<MistakeBookProps> = ({ mistakes, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BookX className="text-red-500" />
          错题集
          <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-3 py-1 rounded-full">
            共 {mistakes.length} 题
          </span>
        </h2>
      </div>

      {mistakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <BookX size={40} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">暂无错题</h3>
          <p className="text-slate-400">继续保持！答错的题目会自动收录到这里。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((record, index) => {
            const { question } = record;
            const isExpanded = expandedId === question.id;
            
            return (
              <motion.div 
                key={record.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  onClick={() => toggleExpand(question.id)}
                  className="p-6 cursor-pointer flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-100">
                        Level {question.difficultyLevel}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 
                      className="text-lg font-bold text-slate-800 leading-snug"
                      dangerouslySetInnerHTML={{ __html: formatChemText(question.questionText) }}
                    />
                  </div>
                  <div className={`p-1 rounded-full ${isExpanded ? 'bg-slate-100 text-slate-600' : 'text-slate-300'}`}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50 border-t border-slate-100 px-6 py-6"
                    >
                      {/* Options Review */}
                      <div className="space-y-2 mb-6">
                        {question.options.map((opt, idx) => {
                          const isCorrect = idx === question.correctOptionIndex;
                          const isWrongSelection = idx === record.userWrongAnswerIndex;
                          
                          let style = "bg-white border-slate-200 text-slate-500";
                          if (isCorrect) style = "bg-green-50 border-green-200 text-green-800 font-medium";
                          if (isWrongSelection) style = "bg-red-50 border-red-200 text-red-800 line-through decoration-red-400";

                          return (
                            <div key={idx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${style}`}>
                              <span dangerouslySetInnerHTML={{ __html: formatChemText(opt) }} />
                              {isCorrect && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">正确答案</span>}
                              {isWrongSelection && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">你的选择</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Analysis */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <AlertCircle size={14} /> 核心解析
                          </h4>
                          <p className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatChemText(question.explanation) }} />
                        </div>
                        
                        {question.misconception && (
                           <div className="pt-4 border-t border-slate-100">
                             <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-2">诊断</h4>
                             <p className="text-orange-800 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
                               {question.misconception}
                             </p>
                           </div>
                        )}
                        
                        {question.learningTip && (
                           <div className="pt-2">
                             <p className="text-slate-400 text-xs italic">{question.learningTip}</p>
                           </div>
                        )}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default MistakeBook;

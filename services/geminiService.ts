
import { DifficultyLevel, Question, Competency } from "../types";

// 移除 GoogleGenAI 引用，确保纯静态部署时不报错
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Assessment questions strictly focused on S and SO2 properties and PDF Capabilities
export const getAssessmentQuestions = async (): Promise<{ questions: { text: string; level: number }[] }> => {
  return new Promise((resolve) => {
    // Simulate async network request
    setTimeout(() => {
      resolve({
        questions: [
          // Level 1: Macro Identification
          { text: "我能准确描述硫单质（颜色、状态）和二氧化硫（气味、溶解性）的物理性质。", level: 1 },
          { text: "我具有安全意识，知道如何处理实验室洒落的水银(Hg)和闻有毒气体(SO2)的方法。", level: 1 },
          { text: "我能辨别自然界中存在的含硫矿物（如黄铁矿、石膏、芒硝）。", level: 1 },
          
          // Level 2: Change Conception
          { text: "我能从化合价角度，解释为什么 SO2 既有氧化性又有还原性，并能列举代表反应。", level: 2 },
          { text: "我理解 SO2 与水反应的“可逆性”，知道亚硫酸是不稳定的酸。", level: 2 },
          { text: "我能书写 SO2 与 NaOH 反应生成正盐或酸式盐的化学方程式。", level: 2 },
          { text: "我能解释 SO2 使品红溶液褪色与氯水使品红溶液褪色的原理差异。", level: 2 },

          // Level 3: Evidence Reasoning & Inquiry
          { text: "我能设计实验鉴别 SO2 和 CO2，并能解释为什么要先除杂再检验。", level: 3 },
          { text: "我能解释为什么用向上排空气法收集 SO2，以及如何进行尾气处理。", level: 3 },
          { text: "我能分析 SO2 在不同环境（如酸性KMnO4、酸性硝酸钡）中表现出的不同性质异常。", level: 3 },
          { text: "我能利用“变量控制”思想，探究 pH 对 SO2 溶解性和化学性质的影响。", level: 3 },

          // Level 4: Social Responsibility & Complex Model
          { text: "我能评估工业上用生石灰(CaO)进行燃煤脱硫的原理和经济价值。", level: 4 },
          { text: "我能运用“价-类二维图”预测硫元素在自然界中的转化路径。", level: 4 },
          { text: "我能从原子利用率和绿色化学角度，评价氨法脱硫工艺的优劣。", level: 4 },
          { text: "我能分析定量实验中（如测定空气中SO2含量）可能存在的干扰因素及误差来源。", level: 4 },
        ]
      });
    }, 600);
  });
};

// Stub for static compatibility
export const generateChemistryQuestion = async (level: DifficultyLevel): Promise<Question> => {
   throw new Error("Static mode only.");
};

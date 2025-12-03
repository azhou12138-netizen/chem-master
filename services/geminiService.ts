
import { GoogleGenAI } from "@google/genai";
import { DifficultyLevel, Question, Competency } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Assessment questions strictly focused on S and SO2 properties and PDF Capabilities
export const getAssessmentQuestions = async (): Promise<{ questions: { text: string; level: number }[] }> => {
  return {
      questions: [
        // Level 1: Macro Identification
        { text: "我能准确描述硫单质（颜色、状态）和二氧化硫（气味、溶解性）的物理性质。", level: 1 },
        { text: "我具有安全意识，知道如何处理实验室洒落的水银(Hg)和闻有毒气体(SO2)的方法。", level: 1 },
        
        // Level 2: Change Conception
        { text: "我能从化合价角度，解释为什么 SO2 既有氧化性又有还原性，并能列举代表反应。", level: 2 },
        { text: "我理解 SO2 与水反应的“可逆性”，知道亚硫酸是不稳定的酸。", level: 2 },
        { text: "我能书写 SO2 与 NaOH 反应生成正盐或酸式盐的化学方程式。", level: 2 },

        // Level 3: Evidence Reasoning & Inquiry
        { text: "我能根据品红褪色加热复原的现象，区分 SO2 和 Cl2 的漂白原理差异。", level: 3 },
        { text: "我能设计实验鉴别 SO2 和 CO2，并能解释为什么要先除杂再检验。", level: 3 },
        { text: "我能解释为什么用向上排空气法收集 SO2，以及如何进行尾气处理。", level: 3 },

        // Level 4: Social Responsibility & Complex Model
        { text: "我能评估工业上用生石灰(CaO)进行燃煤脱硫的原理和经济价值。", level: 4 },
        { text: "我能分析 SO2 在不同环境（如酸性KMnO4、酸性硝酸钡）中表现出的不同性质异常。", level: 4 },
      ]
    };
};

export const generateChemistryQuestion = async (level: DifficultyLevel): Promise<Question> => {
  const prompt = `
    Generate a high-quality single-choice chemistry question for High School Chemistry (Compulsory 2), Chapter 5, Section 1: "Sulfur and Sulfur Dioxide".
    Target Academic Quality Level: ${level} (1=Basic, 2=Understanding, 3=Application/Inquiry, 4=Complex/Comprehensive).

    Key Topics strictly limited to:
    - Sulfur element properties, existence, and reaction with metals (Fe, Cu).
    - SO2 physical/chemical properties (Acidic oxide, Bleaching, Redox).
    - SO2 identification and separation from CO2.
    - Environmental impact (Acid rain) and Industrial application (Desulfurization).
    - DO NOT include Concentrated Sulfuric Acid properties (Dehydration/Passivation) unless directly related to S/SO2 conversion.

    Requirements:
    1. Return ONLY valid JSON matching this schema:
    {
      "id": "gen_${Date.now()}",
      "scenario": "Optional scenario description",
      "questionText": "The question stem",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0-3,
      "explanation": "Detailed explanation of why the correct answer is right AND why others are wrong.",
      "difficultyLevel": ${level},
      "topicTag": "Specific Tag",
      "competency": "One of: 宏观辨识与微观探析, 变化观念与平衡思想, 证据推理与模型认知, 科学探究与创新意识, 科学态度与社会责任",
      "misconception": "Diagnosis of why a student might miss this.",
      "learningTip": "Reference to RenJiao Compulsory 2 textbook.",
      "videoResource": "Search keyword for Bilibili"
    }
    2. Ensure chemical formulas are formatted like "SO2" (frontend handles subscripts) but ions like "SO4 2-" (space before charge).
    3. Language: Simplified Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Question;
    }
    throw new Error("Empty response");
  } catch (e) {
    console.error(e);
    // Fallback if AI fails
    return {
       id: "err", 
       questionText: "网络连接不稳定，请重试。",
       options: ["重试"], 
       correctOptionIndex: 0, 
       difficultyLevel: level, 
       explanation: "",
       topicTag: "Error",
       competency: Competency.MacroMicro,
       scenario: ""
    };
  }
};

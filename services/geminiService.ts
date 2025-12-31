
import { GoogleGenAI } from "@google/genai";
import { DifficultyLevel, Question, Competency } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAssessmentQuestions = async (): Promise<{ questions: { text: string; competency: Competency }[] }> => {
  return {
      questions: [
        // 1. 宏观辨识与微观探析
        { text: "我能从微观角度解释硫元素主要化合价（-2, +4, +6）的形成原因。", competency: Competency.MacroMicro },
        { text: "我能准确书写硫单质燃烧、SO2 与水反应、SO2 与碱反应的化学方程式及离子方程式。", competency: Competency.MacroMicro },
        
        // 2. 变化观念与平衡思想
        { text: "我能理解 SO2 + H2O ⇌ H2SO3 是可逆反应，并能分析外界条件对该平衡的影响。", competency: Competency.ChangeBalance },
        { text: "我能根据硫元素的化合价处于中间价态（+4），推断 SO2 既有氧化性又有还原性。", competency: Competency.ChangeBalance },

        // 3. 证据推理与模型认知
        { text: "面对“无色气体使品红褪色”的现象，我能严谨地分析出可能是 SO2、Cl2 或其他物质。", competency: Competency.EvidenceModel },
        { text: "我能构建“酸性氧化物”模型，并能解释 SO2 与 BaCl2 不反应但与 Ba(NO3)2 反应的反常现象。", competency: Competency.EvidenceModel },

        // 4. 科学探究与创新意识
        { text: "我能设计实验装置，在检验 CO2 气体前，彻底除去混有的 SO2 并检验其是否除尽。", competency: Competency.InquiryInnovation },
        { text: "对于课本未提及的异常实验现象（如 SO2 使石蕊变红不褪色），我有兴趣并能设计对照实验去探究原因。", competency: Competency.InquiryInnovation },

        // 5. 科学态度与社会责任
        { text: "我了解酸雨的形成机制，并能从化学角度评价工业烟气脱硫方案（如钙基固硫、氨法脱硫）的优缺点。", competency: Competency.AttitudeResponsibility },
        { text: "我能意识到含硫化合物在生产生活中的“双刃剑”作用（如葡萄酒保鲜与空气污染）。", competency: Competency.AttitudeResponsibility },
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

    Requirements:
    1. Return ONLY valid JSON matching this schema:
    {
      "id": "gen_${Date.now()}",
      "scenario": "Optional scenario description",
      "questionText": "The question stem",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0-3,
      "explanation": "Detailed explanation.",
      "difficultyLevel": ${level},
      "topicTag": "Specific Tag",
      "competency": "One of: 宏观辨识与微观探析, 变化观念与平衡思想, 证据推理与模型认知, 科学探究与创新意识, 科学态度与社会责任",
      "misconception": "Diagnosis.",
      "learningTip": "Tip.",
      "videoResource": "Search keyword"
    }
    2. Format formulas like "SO2" and ions like "SO4 2-".
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

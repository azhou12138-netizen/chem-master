
export enum AppState {
  WELCOME = 'WELCOME',
  ASSESSMENT = 'ASSESSMENT',
  LEARNING = 'LEARNING',
  MASTERY = 'MASTERY',
  MISTAKE_BOOK = 'MISTAKE_BOOK',
}

export enum Competency {
  MacroMicro = "宏观辨识与微观探析",
  ChangeBalance = "变化观念与平衡思想",
  EvidenceModel = "证据推理与模型认知",
  InquiryInnovation = "科学探究与创新意识",
  AttitudeResponsibility = "科学态度与社会责任"
}

export interface Question {
  id: string;
  scenario: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficultyLevel: DifficultyLevel;
  topicTag: string;
  competency: Competency;
  misconception?: string; 
  learningTip?: string;   
  videoResource?: string; 
}

export enum DifficultyLevel {
  Level1 = 1, // 基础识记 (Basic)
  Level2 = 2, // 规律理解 (Elementary)
  Level3 = 3, // 实验与推断 (Intermediate)
  Level4 = 4  // 综合与探究 (Advanced)
}

export interface UserProgress {
  currentLevel: DifficultyLevel;
  streak: number; // Keep for internal logic if needed, though mostly deprecated
  score: number;
  questionsAnswered: number;
}

export interface MistakeRecord {
  question: Question;
  timestamp: number;
  userWrongAnswerIndex?: number;
}

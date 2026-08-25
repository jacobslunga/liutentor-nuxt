export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

interface Quiz {
  questions: QuizQuestion[];
}

export type QuizDifficulty = "easy" | "medium" | "hard";

export const QUIZ_DIFFICULTIES: QuizDifficulty[] = ["easy", "medium", "hard"];

export const DEFAULT_QUIZ_DIFFICULTY: QuizDifficulty = "medium";

interface QuizMeta {
  courseCode: string;
  sourceExamIds: number[];
  sourceCount: number;
  model: string;
  // Absent on quizzes generated before difficulty existed.
  difficulty?: QuizDifficulty;
}

export interface MultipleChoiceQuizResponse {
  quiz: Quiz;
  meta: QuizMeta;
}

export interface StoredQuizItem {
  id: string;
  createdAt: string;
  data: MultipleChoiceQuizResponse;
}

export interface Exam {
  id: number;
  exam_name: string;
  exam_date: string;
  has_solution: boolean;
  course_code: string;
  pdf_url: string | null;
}

export interface GenerateQuizPayload {
  examIds: number[];
  difficulty: QuizDifficulty;
}

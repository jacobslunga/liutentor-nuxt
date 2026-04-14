export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizMeta {
  courseCode: string;
  sourceExamIds: number[];
  sourceCount: number;
  model: string;
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
  customPrompt?: string;
}

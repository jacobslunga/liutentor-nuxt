export interface Exam {
  id: number;
  exam_name: string;
  exam_date: string;
  has_solution: boolean;
  pass_rate: number;
  statistics: Record<string, number>;
  pdf_url: string;
  course_code: string;
}

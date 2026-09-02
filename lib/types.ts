export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "rating"
  | "date"
  | "yes_no";

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating (1-5)" },
  { value: "date", label: "Date" },
  { value: "yes_no", label: "Yes / No" },
];

export const CHOICE_TYPES: QuestionType[] = [
  "multiple_choice",
  "checkboxes",
  "dropdown",
];

export type FormStatus = "draft" | "published";

export interface FormRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  status: FormStatus;
  accepting_responses: boolean;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[];
  image_url: string | null;
  /** For `multiple_choice` questions: the option string that counts as correct, if this is a quiz question. */
  correct_option: string | null;
  position: number;
  created_at: string;
}

/** The subset of a question sent to respondents — never includes the answer key. */
export type PublicQuestionRow = Omit<QuestionRow, "correct_option">;

export interface ResponseRow {
  id: string;
  form_id: string;
  submitted_at: string;
  respondent_meta: Record<string, unknown>;
}

export interface AnswerRow {
  id: string;
  response_id: string;
  question_id: string;
  value: unknown;
}

export type AnswerValue = string | string[] | number | null;

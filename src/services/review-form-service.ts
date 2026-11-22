import { apiClient } from "@/lib/api-client";

// Base del front público (cruzcontroltours) para armar links /review/:token.
export const FRONT_URL = (
  process.env.NEXT_PUBLIC_FRONT_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const reviewLinkFor = (token: string) =>
  `${FRONT_URL}/review/${token}`;

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para contextos sin Clipboard API.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export type QuestionType = "stars" | "text";

export type FormQuestion = {
  id: number;
  formId: number;
  label: string;
  type: string;
  required: boolean;
  position: number;
  isActive: boolean;
};

export type ReviewFormListItem = {
  id: number;
  tourId: number;
  tourTitle: string;
  title: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  questionsCount: number;
  responsesCount: number;
  questions: FormQuestion[];
};

export type ReviewFormDetail = {
  id: number;
  tourId: number;
  tourTitle: string;
  title: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  questions: FormQuestion[];
};

export type QuestionInput = {
  label: string;
  type: QuestionType;
  required?: boolean;
  position?: number;
  isActive?: boolean;
};

export type FormInput = {
  tourId: number;
  title: string;
  questions: QuestionInput[];
};

export type FormUpdateInput = {
  title?: string;
  tourId?: number;
  isActive?: boolean;
};

export type DuplicateInput = {
  tourId: number;
  title: string;
  deactivateExisting?: boolean;
};

export type ExistingFormInfo = {
  id: number;
  title: string;
};

export type ResponseAnswer = {
  id: number;
  reviewId: number;
  questionId: number;
  questionLabel: string;
  questionType: string;
  ratingValue: number | null;
  textValue: string | null;
};

export type ResponseItem = {
  id: number;
  formId: number;
  formTitle: string;
  tourId: number;
  tourTitle: string;
  bookingId: number | null;
  authorName: string | null;
  createdAt: string;
  answers: ResponseAnswer[];
};

export type QuestionAverage = {
  questionId: number;
  questionLabel: string;
  average: number | null;
  count: number;
};

export type ResponsesPayload = {
  items: ResponseItem[];
  total: number;
  page: number;
  limit: number;
  averages: QuestionAverage[];
};

export type ResponsesQuery = {
  formId?: number;
  tourId?: number;
  page?: number;
  limit?: number;
};

export const listForms = async (tourId?: number): Promise<ReviewFormListItem[]> => {
  const { data } = await apiClient.get<ReviewFormListItem[]>("/review-forms", {
    params: tourId ? { tourId } : undefined,
  });
  return data;
};

export const getForm = async (id: number): Promise<ReviewFormDetail> => {
  const { data } = await apiClient.get<ReviewFormDetail>(`/review-forms/${id}`);
  return data;
};

export const createForm = async (
  input: FormInput,
): Promise<ReviewFormDetail> => {
  const { data } = await apiClient.post<ReviewFormDetail>(
    "/review-forms",
    input,
  );
  return data;
};

export const updateForm = async (
  id: number,
  input: FormUpdateInput,
): Promise<ReviewFormDetail> => {
  const { data } = await apiClient.put<ReviewFormDetail>(
    `/review-forms/${id}`,
    input,
  );
  return data;
};

/** true = se borró; false = tenía respuestas y se desactivó. */
export const deleteForm = async (id: number): Promise<boolean> => {
  const res = await apiClient.delete(`/review-forms/${id}`);
  return res.status === 204;
};

export const duplicateForm = async (
  id: number,
  input: DuplicateInput,
): Promise<ReviewFormDetail> => {
  const { data } = await apiClient.post<ReviewFormDetail>(
    `/review-forms/${id}/duplicate`,
    input,
  );
  return data;
};

export const createQuestion = async (
  formId: number,
  input: QuestionInput,
): Promise<FormQuestion> => {
  const { data } = await apiClient.post<FormQuestion>(
    `/review-forms/${formId}/questions`,
    input,
  );
  return data;
};

export const updateQuestion = async (
  id: number,
  input: Partial<QuestionInput>,
): Promise<FormQuestion> => {
  const { data } = await apiClient.put<FormQuestion>(
    `/review-questions/${id}`,
    input,
  );
  return data;
};

/** true = se borró; false = tenía respuestas y se desactivó. */
export const deleteQuestion = async (id: number): Promise<boolean> => {
  const res = await apiClient.delete(`/review-questions/${id}`);
  return res.status === 204;
};

export const listResponses = async (
  query: ResponsesQuery = {},
): Promise<ResponsesPayload> => {
  const params: Record<string, number> = {};
  if (query.formId) params.formId = query.formId;
  if (query.tourId) params.tourId = query.tourId;
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  const { data } = await apiClient.get<ResponsesPayload>("/review-responses", {
    params,
  });
  return data;
};

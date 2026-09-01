"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AnswerValue, QuestionRow } from "@/lib/types";

export async function submitResponseAction(
  formId: string,
  answers: Record<string, AnswerValue>
) {
  const db = supabaseAdmin();

  const { data: form } = await db
    .from("forms")
    .select("id, status, accepting_responses")
    .eq("id", formId)
    .maybeSingle();

  if (!form || form.status !== "published" || !form.accepting_responses) {
    throw new Error("This form is not currently accepting responses.");
  }

  const { data: questions } = await db
    .from("questions")
    .select("*")
    .eq("form_id", formId)
    .returns<QuestionRow[]>();

  for (const q of questions ?? []) {
    if (!q.required) continue;
    const value = answers[q.id];
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      throw new Error(`"${q.title || "A question"}" is required.`);
    }
  }

  const { data: response, error: responseError } = await db
    .from("responses")
    .insert({ form_id: formId })
    .select("id")
    .single();

  if (responseError || !response) {
    throw new Error(responseError?.message ?? "Could not submit response.");
  }

  const rows = Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== "" && value !== null)
    .map(([questionId, value]) => ({
      response_id: response.id,
      question_id: questionId,
      value,
    }));

  if (rows.length > 0) {
    const { error: answersError } = await db.from("answers").insert(rows);
    if (answersError) throw new Error(answersError.message);
  }

  return { ok: true };
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { FormStatus, QuestionType } from "@/lib/types";

async function assertOwnsForm(formId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("forms")
    .select("id")
    .eq("id", formId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Form not found.");

  return db;
}

export async function updateFormMetaAction(
  formId: string,
  patch: { title?: string; description?: string }
) {
  const db = await assertOwnsForm(formId);
  const { error } = await db.from("forms").update(patch).eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
  revalidatePath("/dashboard");
}

export async function setFormStatusAction(formId: string, status: FormStatus) {
  const db = await assertOwnsForm(formId);
  const { error } = await db.from("forms").update({ status }).eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
  revalidatePath("/dashboard");
}

export async function setAcceptingResponsesAction(
  formId: string,
  accepting_responses: boolean
) {
  const db = await assertOwnsForm(formId);
  const { error } = await db
    .from("forms")
    .update({ accepting_responses })
    .eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
}

export async function addQuestionAction(formId: string, type: QuestionType) {
  const db = await assertOwnsForm(formId);

  const { count } = await db
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId);

  const defaultOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(
    type
  )
    ? ["Option 1", "Option 2"]
    : [];

  const { data, error } = await db
    .from("questions")
    .insert({
      form_id: formId,
      type,
      title: "",
      required: false,
      options: defaultOptions,
      position: count ?? 0,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not add question.");

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return data;
}

export async function updateQuestionAction(
  formId: string,
  questionId: string,
  patch: Partial<{
    title: string;
    description: string;
    required: boolean;
    options: string[];
    type: QuestionType;
  }>
) {
  const db = await assertOwnsForm(formId);
  const { error } = await db
    .from("questions")
    .update(patch)
    .eq("id", questionId)
    .eq("form_id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
}

export async function deleteQuestionAction(formId: string, questionId: string) {
  const db = await assertOwnsForm(formId);
  const { error } = await db
    .from("questions")
    .delete()
    .eq("id", questionId)
    .eq("form_id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
}

export async function reorderQuestionsAction(
  formId: string,
  orderedIds: string[]
) {
  const db = await assertOwnsForm(formId);
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .from("questions")
        .update({ position: index })
        .eq("id", id)
        .eq("form_id", formId)
    )
  );
  revalidatePath(`/dashboard/forms/${formId}/edit`);
}

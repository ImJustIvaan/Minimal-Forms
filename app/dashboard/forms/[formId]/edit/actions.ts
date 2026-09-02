"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteImageByUrl, uploadImage } from "@/lib/supabase/storage";
import type { FormLayout, FormStatus, QuestionType } from "@/lib/types";

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

function normalizeRedirectUrl(value: string | null | undefined) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Enter a full URL, e.g. https://example.com/thanks");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("The redirect URL must start with http:// or https://");
  }
  return parsed.toString();
}

function normalizeAccentColor(value: string | null | undefined) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    throw new Error("Enter a color as a hex code, e.g. #4f46e5");
  }
  return trimmed.toLowerCase();
}

export async function updateFormMetaAction(
  formId: string,
  patch: {
    title?: string;
    description?: string;
    accent_color?: string | null;
    layout?: FormLayout;
    thank_you_heading?: string | null;
    thank_you_message?: string | null;
    redirect_url?: string | null;
  }
) {
  const db = await assertOwnsForm(formId);
  const normalized = {
    ...patch,
    accent_color: normalizeAccentColor(patch.accent_color),
    redirect_url: normalizeRedirectUrl(patch.redirect_url),
  };
  const { error } = await db.from("forms").update(normalized).eq("id", formId);
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

export async function uploadFormBackgroundAction(formId: string, formData: FormData) {
  const db = await assertOwnsForm(formId);

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided.");

  const { data: existing } = await db
    .from("forms")
    .select("background_image_url")
    .eq("id", formId)
    .single();

  const url = await uploadImage(file, `forms/${formId}/background`);

  const { error } = await db
    .from("forms")
    .update({ background_image_url: url })
    .eq("id", formId);
  if (error) throw new Error(error.message);

  await deleteImageByUrl(existing?.background_image_url);

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return url;
}

export async function removeFormBackgroundAction(formId: string) {
  const db = await assertOwnsForm(formId);

  const { data: existing } = await db
    .from("forms")
    .select("background_image_url")
    .eq("id", formId)
    .single();

  const { error } = await db
    .from("forms")
    .update({ background_image_url: null })
    .eq("id", formId);
  if (error) throw new Error(error.message);

  await deleteImageByUrl(existing?.background_image_url);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
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
    correct_option: string | null;
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

export async function uploadQuestionImageAction(
  formId: string,
  questionId: string,
  formData: FormData
) {
  const db = await assertOwnsForm(formId);

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided.");

  const { data: existing } = await db
    .from("questions")
    .select("image_url")
    .eq("id", questionId)
    .single();

  const url = await uploadImage(file, `forms/${formId}/questions/${questionId}`);

  const { error } = await db
    .from("questions")
    .update({ image_url: url })
    .eq("id", questionId)
    .eq("form_id", formId);
  if (error) throw new Error(error.message);

  await deleteImageByUrl(existing?.image_url);

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return url;
}

export async function removeQuestionImageAction(formId: string, questionId: string) {
  const db = await assertOwnsForm(formId);

  const { data: existing } = await db
    .from("questions")
    .select("image_url")
    .eq("id", questionId)
    .single();

  const { error } = await db
    .from("questions")
    .update({ image_url: null })
    .eq("id", questionId)
    .eq("form_id", formId);
  if (error) throw new Error(error.message);

  await deleteImageByUrl(existing?.image_url);
  revalidatePath(`/dashboard/forms/${formId}/edit`);
}

export async function deleteQuestionAction(formId: string, questionId: string) {
  const db = await assertOwnsForm(formId);

  const { data: existing } = await db
    .from("questions")
    .select("image_url")
    .eq("id", questionId)
    .single();

  const { error } = await db
    .from("questions")
    .delete()
    .eq("id", questionId)
    .eq("form_id", formId);
  if (error) throw new Error(error.message);

  await deleteImageByUrl(existing?.image_url);
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

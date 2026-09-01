import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { FormRow, QuestionRow } from "@/lib/types";
import { FormEditor } from "./form-editor";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const { userId } = await auth();
  const db = supabaseAdmin();

  const { data: form } = await db
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("owner_id", userId!)
    .maybeSingle<FormRow>();

  if (!form) notFound();

  const { data: questions } = await db
    .from("questions")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true })
    .returns<QuestionRow[]>();

  return <FormEditor form={form} initialQuestions={questions ?? []} />;
}

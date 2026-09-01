import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { FormRow, QuestionRow } from "@/lib/types";
import { FormRunner } from "./form-runner";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const db = supabaseAdmin();

  const { data: form } = await db
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle<FormRow>();

  if (!form || form.status !== "published") notFound();

  if (!form.accepting_responses) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{form.title}</h1>
          <p className="mt-3 text-ink/60">
            This form is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  const { data: questions } = await db
    .from("questions")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true })
    .returns<QuestionRow[]>();

  return <FormRunner form={form} questions={questions ?? []} />;
}

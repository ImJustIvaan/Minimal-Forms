import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AnswerRow, FormRow, QuestionRow, ResponseRow } from "@/lib/types";
import { ResponseTable, type ResponseWithAnswers } from "./response-table";

export default async function ResponsesPage({
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

  const { data: responses } = await db
    .from("responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })
    .returns<ResponseRow[]>();

  const responseIds = (responses ?? []).map((r) => r.id);
  let answersByResponse: Record<string, Record<string, unknown>> = {};

  if (responseIds.length > 0) {
    const { data: answers } = await db
      .from("answers")
      .select("*")
      .in("response_id", responseIds)
      .returns<AnswerRow[]>();

    answersByResponse = (answers ?? []).reduce<
      Record<string, Record<string, unknown>>
    >((acc, a) => {
      acc[a.response_id] ??= {};
      acc[a.response_id][a.question_id] = a.value;
      return acc;
    }, {});
  }

  const rows: ResponseWithAnswers[] = (responses ?? []).map((r) => ({
    id: r.id,
    submitted_at: r.submitted_at,
    answers: answersByResponse[r.id] ?? {},
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-ink/50 hover:underline"
          >
            ← Back to forms
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {form.title} · Responses
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {rows.length} response{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/dashboard/forms/${form.id}/edit`}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-ink/5"
        >
          Edit form
        </Link>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 p-12 text-center text-ink/50">
            No responses yet.
          </div>
        ) : (
          <ResponseTable
            formId={form.id}
            questions={questions ?? []}
            responses={rows}
          />
        )}
      </div>
    </div>
  );
}

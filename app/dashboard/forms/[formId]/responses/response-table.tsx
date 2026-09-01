"use client";

import { useTransition } from "react";
import type { QuestionRow } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { deleteResponseAction } from "./actions";

export interface ResponseWithAnswers {
  id: string;
  submitted_at: string;
  answers: Record<string, unknown>;
}

export function ResponseTable({
  formId,
  questions,
  responses,
}: {
  formId: string;
  questions: QuestionRow[];
  responses: ResponseWithAnswers[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(responseId: string) {
    if (!confirm("Delete this response?")) return;
    startTransition(() => deleteResponseAction(formId, responseId));
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-ink/10 bg-ink/5 text-ink/60">
          <tr>
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              Submitted
            </th>
            {questions.map((q) => (
              <th key={q.id} className="whitespace-nowrap px-4 py-3 font-medium">
                {q.title || "Untitled question"}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {responses.map((r) => (
            <tr key={r.id} className="border-b border-ink/5 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                {formatDateTime(r.submitted_at)}
              </td>
              {questions.map((q) => (
                <td key={q.id} className="max-w-xs px-4 py-3">
                  {formatAnswer(r.answers[q.id])}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={isPending}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatAnswer(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

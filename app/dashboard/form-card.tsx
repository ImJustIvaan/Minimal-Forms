"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { FormRow } from "@/lib/types";
import { cx, formatDate } from "@/lib/utils";
import { deleteFormAction } from "./actions";

export function FormCard({
  form,
  responseCount,
}: {
  form: FormRow;
  responseCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${form.title}"? This can't be undone.`)) return;
    startTransition(() => deleteFormAction(form.id));
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            className="truncate font-semibold hover:underline"
          >
            {form.title || "Untitled form"}
          </Link>
          <span
            className={cx(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              form.status === "published"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-ink/10 text-ink/60"
            )}
          >
            {form.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink/50">
          Updated {formatDate(form.updated_at)} · {responseCount} response
          {responseCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 pl-4 text-sm font-medium">
        <Link href={`/dashboard/forms/${form.id}/responses`} className="hover:underline">
          Responses
        </Link>
        <Link href={`/dashboard/forms/${form.id}/edit`} className="hover:underline">
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

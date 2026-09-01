"use client";

import { useState, useTransition } from "react";
import type { QuestionRow } from "@/lib/types";
import { CHOICE_TYPES, QUESTION_TYPES } from "@/lib/types";
import {
  deleteQuestionAction,
  updateQuestionAction,
} from "./actions";

export function QuestionEditor({
  formId,
  question,
  index,
  total,
  onMove,
}: {
  formId: string;
  question: QuestionRow;
  index: number;
  total: number;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description);
  const [required, setRequired] = useState(question.required);
  const [optionsText, setOptionsText] = useState(
    question.options.join("\n")
  );
  const [isPending, startTransition] = useTransition();

  const isChoice = CHOICE_TYPES.includes(question.type);

  function commit(patch: Parameters<typeof updateQuestionAction>[2]) {
    startTransition(() => updateQuestionAction(formId, question.id, patch));
  }

  function handleDelete() {
    if (!confirm("Delete this question?")) return;
    startTransition(() => deleteQuestionAction(formId, question.id));
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="mt-2 shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/50">
          Q{index + 1} · {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
        </span>
        <div className="flex shrink-0 items-center gap-1 text-ink/40">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(question.id, "up")}
            className="rounded p-1 hover:bg-ink/5 disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(question.id, "down")}
            className="rounded p-1 hover:bg-ink/5 disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="ml-2 rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-30"
            aria-label="Delete question"
          >
            Delete
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => commit({ title })}
        placeholder="Question title"
        className="mt-3 w-full border-0 border-b border-transparent bg-transparent text-lg font-medium outline-none focus:border-ink/20"
      />

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => commit({ description })}
        placeholder="Description (optional)"
        className="mt-1 w-full border-0 bg-transparent text-sm text-ink/50 outline-none"
      />

      {isChoice && (
        <div className="mt-3">
          <label className="text-xs font-medium text-ink/50">
            Options (one per line)
          </label>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            onBlur={() =>
              commit({
                options: optionsText
                  .split("\n")
                  .map((o) => o.trim())
                  .filter(Boolean),
              })
            }
            rows={3}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => {
            setRequired(e.target.checked);
            commit({ required: e.target.checked });
          }}
          className="h-4 w-4 rounded border-ink/20"
        />
        Required
      </label>
    </div>
  );
}

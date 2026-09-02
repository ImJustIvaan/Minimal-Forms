"use client";

import { useRef, useState, useTransition } from "react";
import type { QuestionRow } from "@/lib/types";
import { CHOICE_TYPES, QUESTION_TYPES } from "@/lib/types";
import {
  deleteQuestionAction,
  removeQuestionImageAction,
  updateQuestionAction,
  uploadQuestionImageAction,
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
  const [correctOption, setCorrectOption] = useState(question.correct_option);
  const [image, setImage] = useState(question.image_url);
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const isChoice = CHOICE_TYPES.includes(question.type);

  function commit(patch: Parameters<typeof updateQuestionAction>[2]) {
    startTransition(() => updateQuestionAction(formId, question.id, patch));
  }

  function handleDelete() {
    if (!confirm("Delete this question?")) return;
    startTransition(() => deleteQuestionAction(formId, question.id));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError("");
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadQuestionImageAction(formId, question.id, formData);
      setImage(url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleRemoveImage() {
    setImage(null);
    startTransition(() => removeQuestionImageAction(formId, question.id));
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
            onBlur={() => {
              const nextOptions = optionsText
                .split("\n")
                .map((o) => o.trim())
                .filter(Boolean);
              const patch: Parameters<typeof updateQuestionAction>[2] = {
                options: nextOptions,
              };
              if (correctOption && !nextOptions.includes(correctOption)) {
                setCorrectOption(null);
                patch.correct_option = null;
              }
              commit(patch);
            }}
            rows={3}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="mt-3">
          <label className="text-xs font-medium text-ink/50">
            Correct answer (optional — makes this a quiz question)
          </label>
          <select
            value={correctOption ?? ""}
            onChange={(e) => {
              const value = e.target.value || null;
              setCorrectOption(value);
              commit({ correct_option: value });
            }}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
          >
            <option value="">No correct answer</option>
            {question.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3">
        <label className="text-xs font-medium text-ink/50">
          Question image (optional)
        </label>
        <div className="mt-1 flex items-center gap-3">
          {image && (
            <div
              className="h-14 w-14 shrink-0 rounded-lg border border-ink/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-ink/5 disabled:opacity-50"
          >
            {isUploadingImage ? "Uploading…" : image ? "Change" : "Upload"}
          </button>
          {image && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
      </div>

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

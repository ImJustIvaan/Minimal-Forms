"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { FormLayout, FormRow, QuestionRow, QuestionType } from "@/lib/types";
import { FORM_LAYOUTS, QUESTION_TYPES } from "@/lib/types";
import { cx, resolveAccent } from "@/lib/utils";
import { QuestionEditor } from "./question-editor";
import {
  addQuestionAction,
  removeFormBackgroundAction,
  reorderQuestionsAction,
  setAcceptingResponsesAction,
  setFormStatusAction,
  updateFormMetaAction,
  uploadFormBackgroundAction,
} from "./actions";

export function FormEditor({
  form,
  initialQuestions,
}: {
  form: FormRow;
  initialQuestions: QuestionRow[];
}) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState(form.status);
  const [accepting, setAccepting] = useState(form.accepting_responses);
  const [addType, setAddType] = useState<QuestionType>("short_text");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [background, setBackground] = useState(form.background_image_url);
  const [bgError, setBgError] = useState("");
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [completionMode, setCompletionMode] = useState<"message" | "redirect">(
    form.redirect_url ? "redirect" : "message"
  );
  const [thankYouHeading, setThankYouHeading] = useState(form.thank_you_heading ?? "");
  const [thankYouMessage, setThankYouMessage] = useState(form.thank_you_message ?? "");
  const [redirectUrl, setRedirectUrl] = useState(form.redirect_url ?? "");
  const [redirectError, setRedirectError] = useState("");
  const [accentColor, setAccentColor] = useState(resolveAccent(form.accent_color));
  const [hasCustomAccent, setHasCustomAccent] = useState(Boolean(form.accent_color));
  const [layout, setLayout] = useState<FormLayout>(form.layout);

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/forms/${form.id}`;
  }, [form.id]);

  function handleAddQuestion() {
    startTransition(async () => {
      const created = await addQuestionAction(form.id, addType);
      setQuestions((prev) => [...prev, created as unknown as QuestionRow]);
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      startTransition(() =>
        reorderQuestionsAction(form.id, next.map((q) => q.id))
      );
      return next;
    });
  }

  function togglePublish() {
    const next = status === "published" ? "draft" : "published";
    setStatus(next);
    startTransition(() => setFormStatusAction(form.id, next));
  }

  function toggleAccepting() {
    const next = !accepting;
    setAccepting(next);
    startTransition(() => setAcceptingResponsesAction(form.id, next));
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleBackgroundChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBgError("");
    setIsUploadingBg(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadFormBackgroundAction(form.id, formData);
      setBackground(url);
    } catch (err) {
      setBgError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploadingBg(false);
    }
  }

  function handleRemoveBackground() {
    setBackground(null);
    startTransition(() => removeFormBackgroundAction(form.id));
  }

  function switchCompletionMode(mode: "message" | "redirect") {
    setCompletionMode(mode);
    if (mode === "message" && redirectUrl) {
      setRedirectUrl("");
      setRedirectError("");
      startTransition(() => updateFormMetaAction(form.id, { redirect_url: null }));
    }
  }

  function commitAccentColor(value: string | null) {
    setAccentColor(resolveAccent(value));
    setHasCustomAccent(Boolean(value));
    startTransition(() => updateFormMetaAction(form.id, { accent_color: value }));
  }

  function commitLayout(value: FormLayout) {
    setLayout(value);
    startTransition(() => updateFormMetaAction(form.id, { layout: value }));
  }

  function commitRedirectUrl() {
    setRedirectError("");
    startTransition(async () => {
      try {
        await updateFormMetaAction(form.id, { redirect_url: redirectUrl || null });
      } catch (err) {
        setRedirectError(err instanceof Error ? err.message : "Invalid URL.");
      }
    });
  }

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cx(
              "rounded-full px-3 py-1 font-medium",
              status === "published"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-ink/10 text-ink/60"
            )}
          >
            {status === "published" ? "Published" : "Draft"}
          </span>
          {status === "published" && (
            <button
              onClick={copyLink}
              className="rounded-full border border-ink/10 px-3 py-1 font-medium hover:bg-ink/5"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink/60">
            <input
              type="checkbox"
              checked={accepting}
              onChange={toggleAccepting}
              className="h-4 w-4 rounded border-ink/20"
            />
            Accepting responses
          </label>
          <button
            onClick={togglePublish}
            disabled={isPending}
            className={cx(
              "rounded-full px-5 py-2 text-sm font-semibold text-white transition-fast hover:opacity-90 disabled:opacity-50",
              status === "published" ? "bg-ink/60" : "bg-accent"
            )}
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => updateFormMetaAction(form.id, { title })}
          placeholder="Form title"
          className="w-full border-0 bg-transparent text-3xl font-semibold tracking-tight outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => updateFormMetaAction(form.id, { description })}
          placeholder="Add a description (optional)"
          rows={2}
          className="mt-2 w-full resize-none border-0 bg-transparent text-ink/60 outline-none"
        />

        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="text-xs font-medium text-ink/50">Background image</p>
          <div className="mt-2 flex items-center gap-3">
            {background && (
              <div
                className="h-16 w-28 shrink-0 rounded-lg border border-ink/10 bg-cover bg-center"
                style={{ backgroundImage: `url(${background})` }}
              />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                disabled={isUploadingBg}
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-ink/5 disabled:opacity-50"
              >
                {isUploadingBg ? "Uploading…" : background ? "Change image" : "Upload image"}
              </button>
              {background && (
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleBackgroundChange}
              className="hidden"
            />
          </div>
          {bgError && <p className="mt-2 text-sm text-red-600">{bgError}</p>}
        </div>

        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="text-xs font-medium text-ink/50">Accent color</p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => commitAccentColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-ink/10 bg-transparent p-0.5"
              aria-label="Accent color"
            />
            <input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              onBlur={(e) => {
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  commitAccentColor(e.target.value);
                } else {
                  setAccentColor(resolveAccent(form.accent_color));
                }
              }}
              className="w-28 rounded-lg border border-ink/10 bg-paper px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
            {hasCustomAccent && (
              <button
                type="button"
                onClick={() => commitAccentColor(null)}
                className="text-sm font-medium text-ink/50 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <h3 className="text-sm font-semibold">Layout</h3>
        <p className="mt-1 text-sm text-ink/50">
          How respondents move through the form.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {FORM_LAYOUTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => commitLayout(opt.value)}
              className={cx(
                "flex-1 rounded-xl border p-3 text-left transition-fast",
                layout === opt.value
                  ? "border-accent bg-accent/10"
                  : "border-ink/15 hover:bg-ink/5"
              )}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="mt-0.5 text-xs text-ink/50">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            formId={form.id}
            question={q}
            index={i}
            total={questions.length}
            onMove={handleMove}
          />
        ))}
      </div>

      {questions.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/50">
          No questions yet. Add your first one below.
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-4">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as QuestionType)}
          className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm outline-none"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddQuestion}
          disabled={isPending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-fast hover:opacity-90 disabled:opacity-50"
        >
          + Add question
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <h3 className="text-sm font-semibold">After someone submits</h3>
        <p className="mt-1 text-sm text-ink/50">
          Show a thank-you message, or send them to a page of your own.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => switchCompletionMode("message")}
            className={cx(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-fast",
              completionMode === "message"
                ? "bg-ink text-paper"
                : "border border-ink/15 hover:bg-ink/5"
            )}
          >
            Thank-you message
          </button>
          <button
            type="button"
            onClick={() => switchCompletionMode("redirect")}
            className={cx(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-fast",
              completionMode === "redirect"
                ? "bg-ink text-paper"
                : "border border-ink/15 hover:bg-ink/5"
            )}
          >
            Redirect to a URL
          </button>
        </div>

        {completionMode === "message" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-ink/50">Heading</label>
              <input
                value={thankYouHeading}
                onChange={(e) => setThankYouHeading(e.target.value)}
                onBlur={() =>
                  updateFormMetaAction(form.id, {
                    thank_you_heading: thankYouHeading || null,
                  })
                }
                placeholder="Thank you!"
                className="mt-1 w-full rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/50">Message</label>
              <textarea
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                onBlur={() =>
                  updateFormMetaAction(form.id, {
                    thank_you_message: thankYouMessage || null,
                  })
                }
                placeholder="Your response has been recorded."
                rows={2}
                className="mt-1 w-full resize-none rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-xs font-medium text-ink/50">Redirect URL</label>
            <input
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              onBlur={commitRedirectUrl}
              placeholder="https://example.com/thanks"
              className="mt-1 w-full rounded-lg border border-ink/10 bg-paper p-2 text-sm outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-ink/40">
              Respondents are sent here right after submitting — no thank-you
              screen is shown.
            </p>
            {redirectError && (
              <p className="mt-1 text-xs text-red-600">{redirectError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

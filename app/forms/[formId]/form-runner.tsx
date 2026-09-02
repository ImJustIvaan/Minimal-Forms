"use client";

import { useState } from "react";
import type { AnswerValue, FormRow, PublicQuestionRow } from "@/lib/types";
import { cx, hexToRgbChannels, resolveAccent } from "@/lib/utils";
import { submitResponseAction } from "./actions";

type Step = "intro" | "question" | "submitting" | "done" | "error";

export function FormRunner({
  form,
  questions,
}: {
  form: FormRow;
  questions: PublicQuestionRow[];
}) {
  const isList = form.layout === "list";
  const [step, setStep] = useState<Step>(isList ? "question" : "intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [missingIds, setMissingIds] = useState<Set<string>>(new Set());

  const question = questions[index];
  const progress = questions.length
    ? Math.round(((index + (step === "intro" ? 0 : 1)) / questions.length) * 100)
    : 0;

  function updateAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const themeStyle = {
    ...(form.background_image_url
      ? {
          backgroundImage: `linear-gradient(rgba(250,250,249,0.88), rgba(250,250,249,0.88)), url(${form.background_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : {}),
    "--accent": resolveAccent(form.accent_color),
    "--accent-rgb": hexToRgbChannels(form.accent_color),
  } as React.CSSProperties;

  function isAnswered(q: PublicQuestionRow) {
    const value = answers[q.id];
    if (!q.required) return true;
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  async function submitAll() {
    setStep("submitting");
    try {
      await submitResponseAction(form.id, answers);
      if (form.redirect_url) {
        window.location.href = form.redirect_url;
        return;
      }
      setStep("done");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStep("error");
    }
  }

  async function goNext() {
    if (!isAnswered(question)) {
      setErrorMessage("This question is required.");
      return;
    }
    setErrorMessage("");

    if (index === questions.length - 1) {
      await submitAll();
      return;
    }

    setIndex((i) => i + 1);
  }

  function goBack() {
    setErrorMessage("");
    if (index === 0) {
      setStep("intro");
    } else {
      setIndex((i) => i - 1);
    }
  }

  async function handleListSubmit() {
    const missing = questions.filter((q) => !isAnswered(q)).map((q) => q.id);
    if (missing.length > 0) {
      setMissingIds(new Set(missing));
      return;
    }
    setMissingIds(new Set());
    await submitAll();
  }

  if (questions.length === 0) {
    return (
      <Centered background={themeStyle}>
        <p className="text-ink/50">This form has no questions yet.</p>
      </Centered>
    );
  }

  if (step === "done") {
    return (
      <Centered background={themeStyle}>
        <h1 className="text-3xl font-semibold tracking-tight">
          {form.thank_you_heading || "Thank you!"}
        </h1>
        <p className="mt-3 text-ink/60">
          {form.thank_you_message || "Your response has been recorded."}
        </p>
      </Centered>
    );
  }

  if (step === "error") {
    return (
      <Centered background={themeStyle}>
        <h1 className="text-2xl font-semibold tracking-tight">
          Couldn&apos;t submit
        </h1>
        <p className="mt-3 text-ink/60">{errorMessage}</p>
        <button
          onClick={() => setStep("question")}
          className="mt-6 rounded-full border border-ink/20 px-6 py-2 text-sm font-medium hover:bg-ink/5"
        >
          Back to form
        </button>
      </Centered>
    );
  }

  if (isList) {
    return (
      <div className="min-h-screen bg-paper text-ink" style={themeStyle}>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-4xl font-semibold tracking-tight">{form.title}</h1>
          {form.description && (
            <p className="mt-3 text-lg text-ink/60">{form.description}</p>
          )}

          <div className="mt-10 flex flex-col gap-10">
            {questions.map((q, i) => (
              <div key={q.id}>
                <h2 className="text-lg font-semibold">
                  {i + 1}. {q.title}
                  {q.required && (
                    <span className="ml-1 text-[var(--accent)]">*</span>
                  )}
                </h2>
                {q.description && (
                  <p className="mt-1 text-sm text-ink/50">{q.description}</p>
                )}
                {q.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.image_url}
                    alt=""
                    className="mt-3 max-h-72 w-full rounded-xl border border-ink/10 object-cover"
                  />
                )}
                <div className="mt-3">
                  <QuestionInput
                    question={q}
                    value={answers[q.id]}
                    onChange={(v) => updateAnswer(q.id, v)}
                    onEnter={() => {}}
                  />
                </div>
                {missingIds.has(q.id) && (
                  <p className="mt-2 text-sm text-red-600">
                    This question is required.
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleListSubmit}
            disabled={step === "submitting"}
            className="mt-10 rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition-fast hover:opacity-90 disabled:opacity-50"
          >
            {step === "submitting" ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <Centered background={themeStyle}>
        <h1 className="text-4xl font-semibold tracking-tight">{form.title}</h1>
        {form.description && (
          <p className="mt-4 text-lg text-ink/60">{form.description}</p>
        )}
        <button
          onClick={() => setStep("question")}
          className="mt-8 rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition-fast hover:opacity-90"
        >
          Start
        </button>
      </Centered>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink" style={themeStyle}>
      <div className="h-1 w-full bg-ink/10">
        <div
          className="h-1 bg-[var(--accent)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
        <span className="text-sm font-medium text-ink/40">
          {index + 1} of {questions.length}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {question.title}
          {question.required && (
            <span className="ml-1 text-[var(--accent)]">*</span>
          )}
        </h2>
        {question.description && (
          <p className="mt-2 text-ink/50">{question.description}</p>
        )}
        {question.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.image_url}
            alt=""
            className="mt-4 max-h-72 w-full rounded-xl border border-ink/10 object-cover"
          />
        )}

        <div className="mt-6">
          <QuestionInput
            question={question}
            value={answers[question.id]}
            onChange={(v) => updateAnswer(question.id, v)}
            onEnter={goNext}
            autoFocus
          />
        </div>

        {errorMessage && step !== "submitting" && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={step === "submitting"}
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium hover:bg-ink/5 disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={goNext}
            disabled={step === "submitting"}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-fast hover:opacity-90 disabled:opacity-50"
          >
            {step === "submitting"
              ? "Submitting…"
              : index === questions.length - 1
                ? "Submit"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Centered({
  children,
  background,
}: {
  children: React.ReactNode;
  background?: React.CSSProperties;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink"
      style={background}
    >
      <div className="max-w-lg">{children}</div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  onEnter,
  autoFocus,
}: {
  question: PublicQuestionRow;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onEnter: () => void;
  autoFocus?: boolean;
}) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-2 text-xl outline-none focus:border-[var(--accent)]"
          placeholder="Type your answer"
        />
      );

    case "long_text":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-lg outline-none focus:border-[var(--accent)]"
          placeholder="Type your answer"
        />
      );

    case "date":
      return (
        <input
          type="date"
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-2 text-xl outline-none focus:border-[var(--accent)]"
        />
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cx(
                "rounded-xl border px-6 py-3 text-sm font-medium transition-fast",
                value === opt
                  ? "border-[var(--accent)] bg-[rgb(var(--accent-rgb)/0.1)] text-[var(--accent)]"
                  : "border-ink/15 hover:bg-ink/5"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={cx(
                "flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold transition-fast",
                value === n
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-ink/15 hover:bg-ink/5"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-lg outline-none focus:border-[var(--accent)]"
        >
          autoFocus={autoFocus}
          <option value="" disabled>
            Select an option
          </option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "multiple_choice":
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cx(
                "rounded-xl border px-4 py-3 text-left text-lg transition-fast",
                value === opt
                  ? "border-[var(--accent)] bg-[rgb(var(--accent-rgb)/0.1)] text-[var(--accent)]"
                  : "border-ink/15 hover:bg-ink/5"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "checkboxes": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() =>
                  onChange(
                    checked
                      ? selected.filter((o) => o !== opt)
                      : [...selected, opt]
                  )
                }
                className={cx(
                  "rounded-xl border px-4 py-3 text-left text-lg transition-fast",
                  checked
                    ? "border-[var(--accent)] bg-[rgb(var(--accent-rgb)/0.1)] text-[var(--accent)]"
                    : "border-ink/15 hover:bg-ink/5"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}

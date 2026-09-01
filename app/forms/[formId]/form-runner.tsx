"use client";

import { useState } from "react";
import type { AnswerValue, FormRow, QuestionRow } from "@/lib/types";
import { cx } from "@/lib/utils";
import { submitResponseAction } from "./actions";

type Step = "intro" | "question" | "submitting" | "done" | "error";

export function FormRunner({
  form,
  questions,
}: {
  form: FormRow;
  questions: QuestionRow[];
}) {
  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const question = questions[index];
  const progress = questions.length
    ? Math.round(((index + (step === "intro" ? 0 : 1)) / questions.length) * 100)
    : 0;

  function setAnswer(value: AnswerValue) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function isAnswered(q: QuestionRow) {
    const value = answers[q.id];
    if (!q.required) return true;
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  async function goNext() {
    if (!isAnswered(question)) {
      setErrorMessage("This question is required.");
      return;
    }
    setErrorMessage("");

    if (index === questions.length - 1) {
      setStep("submitting");
      try {
        await submitResponseAction(form.id, answers);
        setStep("done");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong."
        );
        setStep("error");
      }
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

  if (questions.length === 0) {
    return (
      <Centered>
        <p className="text-ink/50">This form has no questions yet.</p>
      </Centered>
    );
  }

  if (step === "intro") {
    return (
      <Centered>
        <h1 className="text-4xl font-semibold tracking-tight">{form.title}</h1>
        {form.description && (
          <p className="mt-4 text-lg text-ink/60">{form.description}</p>
        )}
        <button
          onClick={() => setStep("question")}
          className="mt-8 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition-fast hover:opacity-90"
        >
          Start
        </button>
      </Centered>
    );
  }

  if (step === "done") {
    return (
      <Centered>
        <h1 className="text-3xl font-semibold tracking-tight">Thank you!</h1>
        <p className="mt-3 text-ink/60">Your response has been recorded.</p>
      </Centered>
    );
  }

  if (step === "error") {
    return (
      <Centered>
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

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <div className="h-1 w-full bg-ink/10">
        <div
          className="h-1 bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
        <span className="text-sm font-medium text-ink/40">
          {index + 1} of {questions.length}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {question.title}
          {question.required && <span className="ml-1 text-accent">*</span>}
        </h2>
        {question.description && (
          <p className="mt-2 text-ink/50">{question.description}</p>
        )}

        <div className="mt-6">
          <QuestionInput
            question={question}
            value={answers[question.id]}
            onChange={setAnswer}
            onEnter={goNext}
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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="max-w-lg">{children}</div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  onEnter,
}: {
  question: QuestionRow;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onEnter: () => void;
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
          autoFocus
          type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-2 text-xl outline-none focus:border-accent"
          placeholder="Type your answer"
        />
      );

    case "long_text":
      return (
        <textarea
          autoFocus
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-lg outline-none focus:border-accent"
          placeholder="Type your answer"
        />
      );

    case "date":
      return (
        <input
          autoFocus
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-2 text-xl outline-none focus:border-accent"
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
                  ? "border-accent bg-accent/10 text-accent"
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
                  ? "border-accent bg-accent text-white"
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
          autoFocus
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-lg outline-none focus:border-accent"
        >
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
                  ? "border-accent bg-accent/10 text-accent"
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
                    ? "border-accent bg-accent/10 text-accent"
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

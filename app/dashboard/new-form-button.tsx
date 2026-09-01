"use client";

import { useTransition } from "react";
import { createFormAction } from "./actions";

export function NewFormButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => createFormAction())}
      disabled={isPending}
      className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:opacity-90 disabled:opacity-50"
    >
      {isPending ? "Creating…" : "New form"}
    </button>
  );
}

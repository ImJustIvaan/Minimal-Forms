import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { FormRow } from "@/lib/types";
import { FormCard } from "./form-card";
import { NewFormButton } from "./new-form-button";

export default async function DashboardPage() {
  const { userId } = await auth();
  const db = supabaseAdmin();

  const { data: forms } = await db
    .from("forms")
    .select("*")
    .eq("owner_id", userId!)
    .order("updated_at", { ascending: false })
    .returns<FormRow[]>();

  const formList = forms ?? [];
  const formIds = formList.map((f) => f.id);

  const counts: Record<string, number> = {};
  if (formIds.length > 0) {
    const { data: responses } = await db
      .from("responses")
      .select("form_id")
      .in("form_id", formIds)
      .returns<{ form_id: string }[]>();

    for (const r of responses ?? []) {
      counts[r.form_id] = (counts[r.form_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your forms</h1>
        <NewFormButton />
      </div>

      {formList.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/20 p-12 text-center text-ink/50">
          You haven&apos;t created any forms yet.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {formList.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              responseCount={counts[form.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

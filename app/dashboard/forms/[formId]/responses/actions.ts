"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteResponseAction(formId: string, responseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");

  const db = supabaseAdmin();
  const { data: form } = await db
    .from("forms")
    .select("id")
    .eq("id", formId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!form) throw new Error("Form not found.");

  const { error } = await db
    .from("responses")
    .delete()
    .eq("id", responseId)
    .eq("form_id", formId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/forms/${formId}/responses`);
}

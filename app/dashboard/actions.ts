"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createFormAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("forms")
    .insert({ owner_id: userId, title: "Untitled form" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create form.");
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/forms/${data.id}/edit`);
}

export async function deleteFormAction(formId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");

  const db = supabaseAdmin();
  const { error } = await db
    .from("forms")
    .delete()
    .eq("id", formId)
    .eq("owner_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">
          Minimal Forms
        </span>
        <nav className="flex items-center gap-3 text-sm font-medium">
          {userId ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-ink px-4 py-2 text-paper transition-fast hover:opacity-90"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="px-3 py-2 hover:opacity-70">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-ink px-4 py-2 text-paper transition-fast hover:opacity-90"
              >
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Forms people actually enjoy filling out.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/60">
          Build surveys, quizzes, and feedback forms in minutes. One question
          at a time, clean by default, responses in real time.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-fast hover:opacity-90"
          >
            Create your first form
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            title: "Conversational forms",
            body: "One question at a time, styled like Typeform, so respondents stay focused and finish more often.",
          },
          {
            title: "Ten question types",
            body: "Short and long text, multiple choice, checkboxes, dropdowns, rating, date, email, number, and yes/no.",
          },
          {
            title: "Real-time responses",
            body: "Every submission lands in Supabase instantly. Review, filter, and export from your dashboard.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-ink/10 bg-white p-6"
          >
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

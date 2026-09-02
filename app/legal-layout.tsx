import Link from "next/link";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="text-sm font-medium text-ink/50 hover:underline">
          ← Minimal Forms
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink/40">Last updated {lastUpdated}</p>

        <div className="mt-10 flex flex-col gap-8 text-ink/80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-2 [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-accent [&_a]:underline">
          {children}
        </div>
      </div>
    </main>
  );
}

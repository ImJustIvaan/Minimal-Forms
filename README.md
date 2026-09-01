# Minimal Forms

A forms builder in the spirit of Typeform / Google Forms / Microsoft Forms — build a form, publish it, share the link, and watch responses come in. Built with Next.js (App Router), Clerk for auth, and Supabase (Postgres) for storage.

## Features

- Sign up / sign in with Clerk
- Dashboard listing all your forms with response counts
- Form builder: title, description, add/reorder/delete questions, mark required
- 10 question types: short text, long text, email, number, multiple choice, checkboxes, dropdown, rating (1–5), date, yes/no
- Draft/publish toggle and an "accepting responses" switch
- A one-question-at-a-time public form runner (Typeform-style), with a shareable link
- Responses table per form, with per-response delete

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Clerk** for authentication ([`@clerk/nextjs`](https://clerk.com/docs))
- **Supabase** (Postgres) for storage, accessed only from the server via the `service_role` key — see [Auth model](#auth-model) below
- **Tailwind CSS** for styling

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Clerk application

1. Go to [clerk.com](https://clerk.com) → create an application (Email is enough, add social providers if you want).
2. In **API Keys**, copy the **Publishable key** and **Secret key**.

### 3. Set up Supabase

A Supabase project has already been provisioned for this app (`minimal-forms`, project ref `ywejtypqnddrukixlrfu`) with the schema in `supabase/migrations/0001_init.sql` applied. If you'd rather use your own project:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/0001_init.sql` against it (SQL Editor, or `supabase db push` with the CLI).
3. Grab the **Project URL** and the **`service_role` secret key** from Project Settings → API.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

SUPABASE_URL=https://ywejtypqnddrukixlrfu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # from Supabase → Project Settings → API
```

### 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Render

This repo includes a `render.yaml` blueprint.

1. In Render, click **New → Blueprint**, pick this repo and the branch you want to deploy.
2. Render reads `render.yaml` and creates a single **Web Service** (`npm install && npm run build` / `npm run start`, free plan).
3. It will prompt you for the env vars marked `sync: false` — fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (`SUPABASE_URL` and the Clerk redirect URLs are already set in `render.yaml`)
4. Deploy. The app binds to Render's `$PORT` automatically via the `start` script.

Note: Render's free plan spins the service down after inactivity, so the first request after a quiet period takes ~30s (cold start).

If you'd rather configure it by hand instead of via the blueprint, create a **Web Service** with build command `npm install && npm run build`, start command `npm run start`, and add the same env vars from `.env.example`.

## Auth model

Auth is handled entirely by Clerk — there's no Supabase Auth involved. Every database read/write goes through **server-only code** (Server Actions and Server Components) using the Supabase `service_role` key, which bypasses row level security. Each server action independently re-checks the signed-in Clerk `userId` against the row's `owner_id` before reading or writing anything, and public routes (`/forms/[formId]`) only ever touch forms with `status = 'published'`.

The `service_role` key is never exposed to the browser — it's read from `process.env` inside files marked `import "server-only"`. Row level security is still enabled on every table as defense-in-depth, with no policies for the `anon`/`authenticated` roles, since the app never queries Supabase from the browser.

## Project structure

```
app/
  page.tsx                        Landing page
  sign-in/, sign-up/              Clerk auth pages
  dashboard/                      Protected dashboard (list, create, delete forms)
    forms/[formId]/edit/          Form builder
    forms/[formId]/responses/     Responses table
  forms/[formId]/                 Public, one-question-at-a-time form runner
lib/
  supabase/admin.ts               Server-only Supabase client (service role)
  supabase/database.types.ts      Hand-written types matching the schema
  types.ts                        Shared app-level types (question types, etc.)
supabase/migrations/0001_init.sql Database schema
proxy.ts                          Clerk middleware (Next.js "proxy" convention)
```

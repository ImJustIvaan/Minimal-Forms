-- Adds support for a form background image, a per-question image, and
-- marking the correct option on a multiple_choice question (for quizzes).

alter table forms
  add column if not exists background_image_url text;

alter table questions
  add column if not exists image_url text,
  add column if not exists correct_option text;

-- Public bucket for uploaded form/question images. Uploads happen
-- server-side via the service_role key (bypasses RLS); reads happen
-- through Storage's public-object URL, which also bypasses RLS for
-- buckets marked public, so no storage.objects policies are needed.
insert into storage.buckets (id, name, public)
values ('form-assets', 'form-assets', true)
on conflict (id) do nothing;

-- Lets a form owner customize the completion screen: either a custom
-- heading/message, or a redirect to an external URL of their own.

alter table forms
  add column if not exists thank_you_heading text,
  add column if not exists thank_you_message text,
  add column if not exists redirect_url text;

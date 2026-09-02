-- Lets a form owner pick a custom accent color for buttons/selections, and
-- choose between the one-question-at-a-time layout and a single scrollable
-- page with every question at once (like Google/MS Forms).

alter table forms
  add column if not exists accent_color text,
  add column if not exists layout text not null default 'conversational';

alter table forms
  add constraint forms_accent_color_check
    check (accent_color is null or accent_color ~ '^#[0-9a-fA-F]{6}$');

alter table forms
  add constraint forms_layout_check
    check (layout in ('conversational', 'list'));

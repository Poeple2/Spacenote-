create table if not exists public.notes (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  color text not null default 'Blue',
  folder text not null default 'Notes',
  cards jsonb not null default '[]'::jsonb,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

grant select, insert, update, delete on public.notes to authenticated;

drop policy if exists "Users can read their own notes" on public.notes;
drop policy if exists "Users can create their own notes" on public.notes;
drop policy if exists "Users can update their own notes" on public.notes;
drop policy if exists "Users can delete their own notes" on public.notes;

create policy "Users can read their own notes"
on public.notes for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own notes"
on public.notes for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own notes"
on public.notes for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notes"
on public.notes for delete to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.update_note_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_notes_timestamp on public.notes;

create trigger update_notes_timestamp
before update on public.notes
for each row
execute function public.update_note_timestamp();

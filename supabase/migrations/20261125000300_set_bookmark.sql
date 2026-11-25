create function public.set_bookmark(sense_id text, saved boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if sense_id is null or sense_id = '' or saved is null then
    raise exception using errcode = '22023', message = 'invalid bookmark';
  end if;
  if saved then
    insert into public.bookmarks (user_id, sense_id)
    values (owner_id, set_bookmark.sense_id)
    on conflict on constraint bookmarks_pkey do nothing;
  else
    delete from public.bookmarks b
    where b.user_id = owner_id and b.sense_id = set_bookmark.sense_id;
  end if;
end;
$$;

revoke all on function public.set_bookmark(text, boolean) from public, anon;
grant execute on function public.set_bookmark(text, boolean) to authenticated;

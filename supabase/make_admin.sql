-- Run once in the Supabase SQL editor after creating the admin user under
-- Authentication → Users. Replace the email with that user's email.
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'admin@example.com'
on conflict (user_id) do nothing;

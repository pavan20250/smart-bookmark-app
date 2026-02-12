# Smart Bookmark

A simple bookmark manager with **Google OAuth only**, private per-user bookmarks, and **real-time sync** across tabs. Built with Next.js (App Router), Supabase (Auth, Database, Realtime), and Tailwind CSS.

## Features

- Sign up / log in with **Google only** (no email/password)
- Add bookmarks (URL + title)
- Bookmarks are **private** per user (RLS)
- **Real-time updates**: open two tabs, add in one → it appears in the other without refresh
- Delete your own bookmarks
- Deployable on Vercel

## Tech stack

- **Next.js 16** (App Router)
- **Supabase** (Auth with Google OAuth, Postgres, Realtime)
- **Tailwind CSS**

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers**: enable **Google** and add your OAuth client ID/secret (from Google Cloud Console). Set the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **SQL Editor**: run the migration to create the table and RLS:

```sql
-- From supabase/migrations/001_bookmarks.sql
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.bookmarks enable row level security;

create policy "Users can view own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.bookmarks;
```

4. **Enable Realtime for bookmarks** (so the list updates in other tabs): either the SQL above already did it, or in the Dashboard go to **Database → Replication**. Find the `supabase_realtime` publication and ensure **bookmarks** is enabled (toggle on).
5. **Project Settings → API**: copy **Project URL** and **anon (public) key**.

### 2. Local env

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and add bookmarks.

### 4. Deploy on Vercel

1. Push the repo to GitHub and import the project in Vercel.
2. Add the same env vars in Vercel (**Settings → Environment Variables**).
3. (Recommended) set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://smart-bookmark-xxx.vercel.app`) so OAuth redirects work correctly.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to your Vercel URL and add it to **Redirect URLs** if needed.

After deploy, use the **live Vercel URL** to sign in with your Google account and test.

## Problems I ran into and how I solved them

1. **Middleware cookies not updating session**  
   The Supabase SSR docs use `getAll`/`setAll` for cookies. In middleware, `setAll` must write to the **response** object, not the request, so the browser receives updated auth cookies. I created a `response` with `NextResponse.next({ request })` and passed `response.cookies.set(name, value, options)` inside `setAll` so the session is refreshed correctly.

2. **Route handler `request` type**  
   In Next.js route handlers, `request` is the standard Web `Request`. It doesn’t have `nextUrl`. I used `new URL(request.url).origin` to get the origin for building OAuth redirect URLs.

3. **Real-time not firing in second tab**  
   Realtime requires the `bookmarks` table to be added to the `supabase_realtime` publication (`alter publication supabase_realtime add table public.bookmarks`). Without that, the client subscription never receives INSERT/DELETE events. After adding the table to the publication, both tabs get updates.

4. **Google OAuth redirect after deploy**  
   On Vercel, the redirect back from Google must go to the production URL. I set `NEXT_PUBLIC_SITE_URL` in Vercel and use it where needed; for the sign-in route I used `request.url`’s origin so the same code works in dev and production without hardcoding.

## License

MIT

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookmarkManager } from './BookmarkManager';

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, url, title, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold text-amber-400">Smart Bookmark</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-zinc-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Your bookmarks</h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Home
          </Link>
        </div>
        <BookmarkManager initialBookmarks={bookmarks ?? []} />
      </main>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookmarkManager } from './BookmarkManager';

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  const avatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, url, title, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-stone-200 text-stone-800">
      <header className="border-b border-stone-300 bg-stone-100/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold text-amber-600">Smart Bookmark</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-medium text-amber-700">
                  {name ? name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() ?? '?'}
                </div>
              )}
              <div className="hidden sm:block">
                {name && (
                  <p className="text-sm font-medium text-stone-800 leading-tight">{name}</p>
                )}
                <p className="text-xs text-stone-500 leading-tight">{user.email}</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-200 hover:text-stone-700 cursor-pointer transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-800">Your bookmarks</h1>
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            ← Home
          </Link>
        </div>
        <BookmarkManager initialBookmarks={bookmarks ?? []} />
      </main>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/bookmarks');

  const { error: errorParam } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-2">
          Smart Bookmark
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Sign in with Google to save and sync your bookmarks.
        </p>
        {errorParam && (
          <p className="mb-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {decodeURIComponent(errorParam)}
          </p>
        )}
        <a
          href="/auth/signin"
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-zinc-900 font-medium py-3 px-4 hover:bg-zinc-100 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </a>
        <p className="mt-6 text-center text-zinc-500 text-xs">
          No email/password — Google OAuth only.
        </p>
      </div>
      <Link
        href="/"
        className="mt-6 text-zinc-500 hover:text-zinc-300 text-sm"
      >
        ← Back home
      </Link>
    </div>
  );
}

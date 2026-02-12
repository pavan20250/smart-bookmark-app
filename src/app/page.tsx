import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/bookmarks');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-200 text-stone-800 px-4">
      <h1 className="text-3xl font-bold tracking-tight text-amber-600 mb-2">
        Smart Bookmark
      </h1>
      <p className="text-stone-500 text-center mb-8 max-w-sm">
        Save links, sync across devices, and see updates in real time. Sign in with Google to get started.
      </p>
      <Link
        href="/login"
        className="rounded-xl bg-amber-500 px-8 py-3 font-medium text-stone-900 hover:bg-amber-400 transition shadow-sm hover:shadow"
      >
        Sign in with Google
      </Link>
    </div>
  );
}

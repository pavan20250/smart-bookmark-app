'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addBookmark, deleteBookmark } from '@/app/actions';

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
};

function toBookmark(row: Record<string, unknown>): Bookmark {
  return {
    id: String(row.id),
    url: String(row.url ?? ''),
    title: String(row.title ?? ''),
    created_at: String(row.created_at ?? ''),
  };
}

export function BookmarkManager({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setBookmarks((prev) => [toBookmark(payload.new as Record<string, unknown>), ...prev]);
          }
          if (payload.eventType === 'DELETE' && payload.old) {
            const old = payload.old as Record<string, unknown>;
            setBookmarks((prev) => prev.filter((b) => b.id !== old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error – is the bookmarks table in the supabase_realtime publication?');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    const formData = new FormData();
    formData.set('url', url);
    formData.set('title', title);
    const result = await addBookmark(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUrl('');
    setTitle('');
  }

  async function handleDelete(id: string) {
    setError('');
    const result = await deleteBookmark(id);
    if (result.error) setError(result.error);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1 rounded-lg border border-stone-300 bg-stone-100 px-4 py-2.5 text-stone-800 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-1 rounded-lg border border-stone-300 bg-stone-100 px-4 py-2.5 text-stone-800 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50 shadow-sm"
        >
          {pending ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-100/80 px-4 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {bookmarks.length === 0 && (
          <li className="rounded-lg border border-dashed border-stone-300 bg-stone-100/80 py-8 text-center text-stone-500">
            No bookmarks yet. Add one above.
          </li>
        )}
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 shadow-sm hover:shadow transition-shadow"
          >
            <div className="min-w-0 flex-1">
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-600 hover:text-amber-500 hover:underline truncate block"
              >
                {b.title}
              </a>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 truncate block hover:text-stone-700"
              >
                {b.url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(b.id)}
              className="shrink-0 rounded px-3 py-1.5 text-sm text-stone-500 hover:bg-red-100/80 hover:text-red-700 transition-colors"
              aria-label={`Delete ${b.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

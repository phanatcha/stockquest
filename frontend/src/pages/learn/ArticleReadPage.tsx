import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';
import { MediaThumb } from './MediaThumb';
import { categoryColor, categoryLabel } from './learnStyles';
import type { ArticleCategory } from './types';

type ArticlePayload =
  | { locked: true; tierRequirement: number; title: string }
  | {
      locked: false;
      article: {
        id: string;
        title: string;
        author: string;
        readTimeMinutes: number;
        body: string;
        tags: string[];
        category: ArticleCategory;
        publishedAt: string;
        thumbnailKey: string;
      };
      userArticle: { status: string };
    };

export function ArticleReadPage() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const courseId = sp.get('courseId');
  const lessonId = sp.get('lessonId');

  const [data, setData] = useState<ArticlePayload | null>(null);
  const [related, setRelated] = useState<
    Array<{ id: string; title: string; category: ArticleCategory }>
  >([]);
  const [toast, setToast] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [atBottom, setAtBottom] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(learnUrl(`/articles/${id}`), { headers: learnHeaders() });
      setData(await res.json());
      const rr = await fetch(learnUrl(`/articles/${id}/related`), { headers: learnHeaders() });
      if (rr.ok) setRelated(await rr.json());
    })();
  }, [id]);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!id || !data || data.locked) return;
    if (started.current) return;
    started.current = true;
    void fetch(learnUrl(`/articles/${id}/start`), { method: 'POST', headers: learnHeaders() });
  }, [id, data]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max <= 0 ? 1 : el.scrollTop / max;
      setScrollPct(Math.min(1, pct));
      if (pct >= 0.97) setAtBottom(true);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [data]);

  const complete = async () => {
    if (!id || !data || data.locked) return;
    const res = await fetch(learnUrl(`/articles/${id}/complete`), {
      method: 'POST',
      headers: learnHeaders(),
      body: JSON.stringify({
        secondsOnPage: seconds,
        scrollReachedBottom: atBottom,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof json.message === 'string'
          ? json.message
          : Array.isArray(json.message)
            ? json.message.join(', ')
            : 'Could not mark complete yet.';
      setToast(msg);
      return;
    }
    let msg = json.alreadyCompleted
      ? 'Already completed.'
      : `Article complete! +${json.xpEarned} XP · +${json.barleyEarned} Barley`;

    if (courseId && lessonId && res.ok) {
      const lr = await fetch(learnUrl(`/courses/${courseId}/lessons/${lessonId}/complete`), {
        method: 'POST',
        headers: learnHeaders(),
      });
      if (lr.ok) {
        const cj = await lr.json();
        if (cj.courseJustCompleted) {
          msg += ` Course complete! +${cj.xpEarned} XP · +${cj.barleyEarned} Barley.`;
        }
      }
    }
    setToast(msg);
  };

  if (!data) return <p className="text-zinc-500">Loading…</p>;

  if (data.locked) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">{data.title}</h2>
        <p className="text-zinc-400 text-sm">
          This content requires tier {data.tierRequirement}. Level up and pass the prerequisite
          quiz to unlock.
        </p>
        <Link to="/learn/articles" className="inline-block mt-6 text-sky-400 font-bold">
          ← Back to articles
        </Link>
      </div>
    );
  }

  const { article } = data;
  const paragraphs = article.body.split(/\n\n+/);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="h-1 rounded-full bg-zinc-800 overflow-hidden sticky top-0 z-10">
        <div
          className="h-full bg-sky-500 transition-all"
          style={{ width: `${Math.max(scrollPct * 100, atBottom ? 100 : 0)}%` }}
        />
      </div>

      <Link
        to="/learn/articles"
        className="text-sm font-bold text-zinc-400 hover:text-white inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learn
      </Link>

      <header>
        <MediaThumb thumbnailKey={article.thumbnailKey} className="h-32 rounded-xl overflow-hidden mb-4" />
        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${categoryColor[article.category]}`}
        >
          {categoryLabel[article.category]}
        </span>
        <h1 className="text-3xl font-black text-white mt-3 leading-tight">{article.title}</h1>
        <p className="text-sm text-zinc-500 mt-2">
          {article.author} · {article.readTimeMinutes} min read ·{' '}
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      </header>

      <div
        ref={bodyRef}
        className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 text-zinc-200 leading-relaxed"
      >
        {paragraphs.map((p, i) => {
          const line = p.trim();
          if (line.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-black text-white pt-2">
                {line.replace(/^##\s+/, '')}
              </h2>
            );
          }
          return (
            <p key={i} className="text-[15px]">
              {line}
            </p>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {article.tags.map((t) => (
          <span key={t} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg">
            {t}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={() => void complete()}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          Mark finished (scroll to end or meet read time)
        </button>
        {courseId && lessonId && (
          <Link
            to={`/learn/courses/${courseId}`}
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            Back to course
          </Link>
        )}
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 px-4 py-3 text-sm font-bold">
          {toast}
        </div>
      )}

      <section className="border-t border-zinc-800 pt-8">
        <h3 className="text-lg font-black text-white mb-4">Related articles</h3>
        <div className="flex flex-col gap-2">
          {related.map((r) => (
            <Link
              key={r.id}
              to={`/learn/articles/${r.id}`}
              className="text-sky-400 font-bold hover:underline"
            >
              {r.title}
            </Link>
          ))}
          {related.length === 0 && <p className="text-zinc-500 text-sm">No suggestions yet.</p>}
        </div>
      </section>
    </div>
  );
}

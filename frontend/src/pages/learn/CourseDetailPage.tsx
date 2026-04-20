import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ClipboardList, Lock } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';
import { MediaThumb } from './MediaThumb';

type Lesson = {
  id: string;
  orderIndex: number;
  lessonType: 'ARTICLE' | 'QUIZ';
  referenceId: string;
  title: string;
  done: boolean;
  locked: boolean;
};

type Detail = {
  locked: boolean;
  tierRequirement: number;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailKey: string;
    xpReward: number;
    barleyReward: number;
    estimatedMinutes: number;
  };
  lessons: Lesson[];
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await fetch(learnUrl(`/courses/${id}`), { headers: learnHeaders() });
    setData(await res.json());
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) return <p className="text-zinc-500">Loading…</p>;

  if (data.locked) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">{data.course.title}</h2>
        <p className="text-zinc-400 text-sm">Requires tier {data.tierRequirement}.</p>
        <Link to="/learn/courses" className="inline-block mt-6 text-sky-400 font-bold">
          ← Back
        </Link>
      </div>
    );
  }

  const c = data.course;
  const next = data.lessons.find((l) => !l.done && !l.locked);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link
        to="/learn/courses"
        className="text-sm font-bold text-zinc-400 hover:text-white inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      <header className="rounded-2xl border border-zinc-800 bg-[#151515] overflow-hidden">
        <MediaThumb thumbnailKey={c.thumbnailKey} className="h-36" />
        <div className="p-6">
        <h1 className="text-3xl font-black text-white">{c.title}</h1>
        <p className="text-zinc-400 mt-2">{c.description}</p>
        <p className="text-sm text-zinc-500 mt-4">
          Rewards: <span className="text-white font-bold">{c.xpReward} XP</span>,{' '}
          <span className="text-white font-bold">{c.barleyReward} Barley</span> · ~
          {c.estimatedMinutes} min
        </p>
        <button
          type="button"
          className="mt-4 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          onClick={() =>
            void (async () => {
              await fetch(learnUrl(`/courses/${c.id}/start`), {
                method: 'POST',
                headers: learnHeaders(),
              });
              await load();
            })()
          }
        >
          {next ? 'Continue course' : 'Start course'}
        </button>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-black text-white mb-3">Lessons</h2>
        <ol className="flex flex-col gap-2">
          {data.lessons.map((l) => (
            <li
              key={l.id}
              className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
                l.done
                  ? 'border-emerald-800/60 bg-emerald-950/20'
                  : l.locked
                    ? 'border-zinc-800 bg-zinc-900/40 opacity-60'
                    : 'border-zinc-700 bg-[#1a1a1a]'
              }`}
            >
              {l.lessonType === 'ARTICLE' ? (
                <BookOpen className="w-5 h-5 text-sky-400 shrink-0" />
              ) : (
                <ClipboardList className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 font-bold">Lesson {l.orderIndex + 1}</p>
                <p className="font-bold text-white truncate">{l.title}</p>
              </div>
              {l.done && <span className="text-xs font-black text-emerald-400">Done</span>}
              {!l.done && !l.locked && l.lessonType === 'ARTICLE' && (
                <Link
                  to={`/learn/articles/${l.referenceId}?courseId=${c.id}&lessonId=${l.id}`}
                  className="text-xs font-black text-sky-400 hover:underline shrink-0"
                >
                  Open
                </Link>
              )}
              {!l.done && !l.locked && l.lessonType === 'QUIZ' && (
                <Link
                  to={`/learn/quizzes/${l.referenceId}?courseId=${c.id}&lessonId=${l.id}`}
                  className="text-xs font-black text-sky-400 hover:underline shrink-0"
                >
                  Open
                </Link>
              )}
              {l.locked && <Lock className="w-4 h-4 text-zinc-600" />}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

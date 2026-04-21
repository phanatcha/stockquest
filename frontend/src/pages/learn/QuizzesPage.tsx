import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';

type QuizRow = {
  id: string;
  title: string;
  description: string | null;
  tierUnlocked: number;
  tierRequirement: number;
  isTierPrerequisite: boolean;
  passScore: number;
  cooldownMinutes: number;
  questions: { id: string }[];
  locked: boolean;
  bestScore: number | null;
  passed: boolean;
  attemptCount: number;
  cooldownUntil: string | null;
};

export function QuizzesPage() {
  const [tierMode, setTierMode] = useState<'tier' | 'practice'>('tier');
  const [rows, setRows] = useState<QuizRow[] | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(learnUrl('/quizzes'), { headers: learnHeaders() });
      if (res.ok) setRows(await res.json());
    })();
  }, []);

  const filtered =
    rows?.filter((q) => (tierMode === 'tier' ? q.isTierPrerequisite : !q.isTierPrerequisite)) ??
    [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-xl border border-zinc-800 p-1 bg-[#1a1a1a] w-fit">
        <button
          type="button"
          className={`px-4 py-2 rounded-lg text-sm font-bold ${
            tierMode === 'tier' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
          }`}
          onClick={() => setTierMode('tier')}
        >
          Tier quizzes
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg text-sm font-bold ${
            tierMode === 'practice' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
          }`}
          onClick={() => setTierMode('practice')}
        >
          Practice
        </button>
      </div>

      {!rows ? (
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
      ) : (
        <div className="grid gap-4">
          {filtered.map((q) => (
            <Link
              key={q.id}
              to={q.locked ? '#' : `/learn/quizzes/${q.id}`}
              onClick={(e) => q.locked && e.preventDefault()}
              className={`rounded-xl border border-zinc-800 bg-[#151515] p-5 ${
                q.locked ? 'opacity-70 cursor-not-allowed' : 'hover:border-zinc-600'
              }`}
            >
              <div className="flex justify-between gap-2">
                <h3 className="text-lg font-black text-white">{q.title}</h3>
                {q.locked && <Lock className="w-5 h-5 text-zinc-500 shrink-0" />}
              </div>
              {q.description && <p className="text-sm text-zinc-400 mt-1">{q.description}</p>}
              <p className="text-xs text-zinc-500 mt-3">
                {q.questions.length} questions · Pass {(q.passScore * 100).toFixed(0)}%
                {q.isTierPrerequisite && ` · Unlocks tier ${q.tierUnlocked}`}
              </p>
              <p className="text-xs mt-2">
                {q.passed ? (
                  <span className="text-emerald-400 font-bold">Passed</span>
                ) : q.cooldownUntil && new Date(q.cooldownUntil) > new Date() ? (
                  <span className="text-amber-300 font-bold">
                    Cooldown until {new Date(q.cooldownUntil).toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-zinc-500 font-bold">Not taken</span>
                )}
                {q.bestScore != null && (
                  <span className="text-zinc-500 ml-2">
                    Best: {(q.bestScore * 100).toFixed(0)}%
                  </span>
                )}
              </p>
              {q.locked && (
                <p className="text-xs text-amber-300 mt-2">Requires tier {q.tierRequirement}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

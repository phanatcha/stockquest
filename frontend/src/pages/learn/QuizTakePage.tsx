import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { getApiBase } from '../../config/api';
import { learnHeaders, learnUrl } from './learnApi';

type QQuestion = { id: string; text: string; options: string[]; points: number };

type QuizFull = {
  id: string;
  title: string;
  description: string | null;
  passScore: number;
  questions: QQuestion[];
  tierRequirement: number;
  isTierPrerequisite: boolean;
  tierUnlocked: number;
};

type QuizState = {
  locked: boolean;
  passed: boolean;
  cooldownUntil: string | null;
  bestScore: number | null;
};

type BreakdownRow = {
  text: string;
  correctIndex: number;
  yourIndex: number;
  correct: boolean;
  explanation: string | null;
};

type SubmitResult = {
  attempt: { score: number; passed: boolean };
  breakdown: BreakdownRow[];
  xpEarned: number;
  barleyEarned: number;
  firstPassRewards: boolean;
};

export function QuizTakePage() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const courseId = sp.get('courseId');
  const lessonId = sp.get('lessonId');

  const [full, setFull] = useState<QuizFull | null>(null);
  const [state, setState] = useState<QuizState | null>(null);
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const headers = useMemo(() => learnHeaders(), []);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const [r1, r2] = await Promise.all([
        fetch(`${getApiBase()}/gamification/quizzes`, { headers }),
        fetch(learnUrl('/quizzes'), { headers }),
      ]);
      const list = r1.ok ? await r1.json() : [];
      const enriched = r2.ok ? await r2.json() : [];
      const q = list.find((x: QuizFull) => x.id === id);
      const st = enriched.find((x: { id: string }) => x.id === id);
      setFull(q ?? null);
      setState(
        st
          ? {
              locked: st.locked,
              passed: st.passed,
              cooldownUntil: st.cooldownUntil,
              bestScore: st.bestScore,
            }
          : null,
      );
    })();
  }, [id, headers]);

  const q = full?.questions[idx];

  const submitAll = async (finalAnswers: number[]) => {
    if (!id) return;
    setErr(null);
    const res = await fetch(`${getApiBase()}/gamification/quizzes/${id}/attempt`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers: finalAnswers }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof json.message === 'string' ? json.message : 'Submit failed');
      return;
    }
    setResult(json);
    setPhase('done');

    if (json.attempt?.passed && courseId && lessonId) {
      await fetch(learnUrl(`/courses/${courseId}/lessons/${lessonId}/complete`), {
        method: 'POST',
        headers,
      });
    }
  };

  const onPickNext = () => {
    if (picked == null || !full) return;
    const next = [...answers, picked];
    setAnswers(next);
    setPicked(null);
    if (idx + 1 >= full.questions.length) {
      void submitAll(next);
    } else {
      setIdx(idx + 1);
    }
  };

  if (!full || !state) return <p className="text-zinc-500">Loading…</p>;

  if (state.locked) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-8 text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">{full.title}</h2>
        <p className="text-zinc-400 text-sm">Requires tier {full.tierRequirement}.</p>
        <Link to="/learn/quizzes" className="inline-block mt-6 text-sky-400 font-bold">
          ← Back
        </Link>
      </div>
    );
  }

  const cooldownActive =
    state.cooldownUntil && !state.passed && new Date(state.cooldownUntil) > new Date();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link
        to="/learn/quizzes"
        className="text-sm font-bold text-zinc-400 hover:text-white inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to quizzes
      </Link>

      {phase === 'intro' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-6">
          <h1 className="text-2xl font-black text-white">{full.title}</h1>
          {full.description && <p className="text-zinc-400 mt-2">{full.description}</p>}
          <p className="text-sm text-zinc-500 mt-4">
            {full.questions.length} questions · Pass at {(full.passScore * 100).toFixed(0)}%
            {full.isTierPrerequisite && ` · Unlocks tier ${full.tierUnlocked}`}
          </p>
          {state.bestScore != null && (
            <p className="text-sm text-zinc-400 mt-2">
              Best score: {(state.bestScore * 100).toFixed(0)}%
            </p>
          )}
          {cooldownActive && (
            <p className="text-amber-300 font-bold mt-4">
              Retry after {new Date(state.cooldownUntil!).toLocaleString()}
            </p>
          )}
          <button
            type="button"
            disabled={!!cooldownActive || (state.passed && full.isTierPrerequisite)}
            className="mt-6 bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl"
            onClick={() => {
              setPhase('run');
              setIdx(0);
              setAnswers([]);
              setPicked(null);
              setResult(null);
            }}
          >
            {state.passed && full.isTierPrerequisite
              ? 'Already passed'
              : cooldownActive
                ? 'On cooldown'
                : 'Start quiz'}
          </button>
        </div>
      )}

      {phase === 'run' && q && (
        <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-6">
          <div className="h-1 rounded-full bg-zinc-800 mb-6 overflow-hidden">
            <div
              className="h-full bg-sky-500"
              style={{ width: `${((idx + 1) / full.questions.length) * 100}%` }}
            />
          </div>
          <p className="text-xs font-bold text-zinc-500 mb-2">
            Question {idx + 1} of {full.questions.length}
          </p>
          <h2 className="text-lg font-bold text-white mb-4">{q.text}</h2>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const sel = picked === i;
              const cls = sel
                ? 'border-sky-500 bg-sky-950/30'
                : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicked(i)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm font-medium text-white transition-colors ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={picked == null}
            className="mt-6 bg-sky-600 disabled:opacity-40 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg text-sm"
            onClick={() => onPickNext()}
          >
            {idx + 1 >= full.questions.length ? 'Submit quiz' : 'Next question'}
          </button>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-6 space-y-4">
          <h2 className="text-2xl font-black text-white">Results</h2>
          <p
            className={`text-3xl font-black ${result.attempt.passed ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {(result.attempt.score * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-zinc-400">
            Pass required: {(full.passScore * 100).toFixed(0)}% ·{' '}
            {result.attempt.passed ? 'Passed' : 'Not passed'}
          </p>
          {result.firstPassRewards && (
            <p className="text-emerald-300 font-bold text-sm">
              +{result.xpEarned} XP · +{result.barleyEarned} Barley
            </p>
          )}
          <div className="border-t border-zinc-800 pt-4 space-y-3 max-h-64 overflow-y-auto">
            {result.breakdown.map((b, i) => (
              <div key={i} className="text-sm border border-zinc-800 rounded-lg p-3">
                <p className="text-white font-bold">{b.text}</p>
                <p className={b.correct ? 'text-emerald-400 mt-1' : 'text-red-400 mt-1'}>
                  {b.correct ? 'Correct' : `Your answer vs correct: ${b.yourIndex} / ${b.correctIndex}`}
                </p>
                {b.explanation && <p className="text-zinc-500 mt-1">{b.explanation}</p>}
              </div>
            ))}
          </div>
          <Link
            to="/learn/quizzes"
            className="inline-block text-sky-400 font-bold text-sm hover:underline"
          >
            Back to quizzes
          </Link>
        </div>
      )}

      {err && <p className="text-red-400 font-bold text-sm">{err}</p>}
    </div>
  );
}

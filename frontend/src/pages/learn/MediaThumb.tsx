const thumbGrad: Record<string, string> = {
  chart: 'from-sky-900/80 to-zinc-900',
  shield: 'from-emerald-900/70 to-zinc-900',
  mind: 'from-violet-900/70 to-zinc-900',
  candle: 'from-amber-900/60 to-zinc-900',
  portfolio: 'from-teal-900/60 to-zinc-900',
  macro: 'from-rose-900/50 to-zinc-900',
  notebook: 'from-slate-800 to-zinc-900',
  target: 'from-orange-900/50 to-zinc-900',
  layers: 'from-indigo-900/60 to-zinc-900',
  pulse: 'from-fuchsia-900/50 to-zinc-900',
  academy: 'from-cyan-900/50 to-zinc-900',
};

export function MediaThumb({
  thumbnailKey,
  className = 'h-24',
}: {
  thumbnailKey: string;
  className?: string;
}) {
  const grad = thumbGrad[thumbnailKey] ?? 'from-zinc-800 to-zinc-900';
  const label = thumbnailKey.replace(/-/g, ' ');
  return (
    <div
      className={`${className} shrink-0 bg-gradient-to-br ${grad} flex items-center justify-center text-zinc-300/90 text-[10px] font-black uppercase tracking-widest px-2 text-center border-b border-zinc-800/80`}
    >
      {label}
    </div>
  );
}

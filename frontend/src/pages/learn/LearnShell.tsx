import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const tabs = [
  { to: '/learn/home', label: 'Home' },
  { to: '/learn/articles', label: 'Articles' },
  { to: '/learn/courses', label: 'Courses' },
  { to: '/learn/quizzes', label: 'Quizzes' },
];

export function LearnShell() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-4">
      <div className="flex flex-col border-b border-zinc-800 pb-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-sky-500 shrink-0" />
          StockQuest Academy
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mt-1">
          Articles, structured courses, and quizzes — earn XP, Barley, and tier access.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-[#1a1a1a] border border-zinc-800">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex-1 min-w-[88px] text-center py-3 px-3 rounded-lg text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-zinc-700 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

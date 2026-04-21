import { Navigate, Route, Routes } from 'react-router-dom';
import { LearnShell } from './learn/LearnShell';
import { LearnHomePage } from './learn/LearnHomePage';
import { ArticlesPage } from './learn/ArticlesPage';
import { ArticleReadPage } from './learn/ArticleReadPage';
import { CoursesPage } from './learn/CoursesPage';
import { CourseDetailPage } from './learn/CourseDetailPage';
import { QuizzesPage } from './learn/QuizzesPage';
import { QuizTakePage } from './learn/QuizTakePage';

export default function Learn() {
  return (
    <Routes>
      <Route element={<LearnShell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<LearnHomePage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/:id" element={<ArticleReadPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="quizzes/:id" element={<QuizTakePage />} />
      </Route>
    </Routes>
  );
}

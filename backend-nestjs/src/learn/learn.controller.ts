import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArticleCategory } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LearnService } from './learn.service';
import { QuizzesService } from '../gamification/quizzes.service';

@Controller('learn')
@UseGuards(JwtAuthGuard)
export class LearnController {
  constructor(
    private readonly learn: LearnService,
    private readonly quizzesService: QuizzesService,
  ) {}

  @Get('home')
  home(@Request() req: { user: { userId: string } }) {
    return this.learn.getHome(req.user.userId);
  }

  @Get('articles')
  articles(
    @Request() req: { user: { userId: string } },
    @Query('search') search?: string,
    @Query('category') category?: ArticleCategory,
    @Query('tier') tier?: string,
    @Query('status') status?: 'UNREAD' | 'IN_PROGRESS' | 'COMPLETED',
    @Query('sort') sort?: string,
  ) {
    return this.learn.listArticles(req.user.userId, {
      search,
      category,
      tier: tier != null && tier !== '' ? parseInt(tier, 10) : undefined,
      status,
      sort,
    });
  }

  @Get('articles/:id')
  article(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.learn.getArticle(req.user.userId, id);
  }

  @Post('articles/:id/start')
  startArticle(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.learn.startArticle(req.user.userId, id);
  }

  @Post('articles/:id/complete')
  completeArticle(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { secondsOnPage: number; scrollReachedBottom: boolean },
  ) {
    return this.learn.completeArticle(req.user.userId, id, {
      secondsOnPage: Number(body.secondsOnPage) || 0,
      scrollReachedBottom: !!body.scrollReachedBottom,
    });
  }

  @Get('articles/:id/related')
  related(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.learn.relatedArticles(req.user.userId, id);
  }

  @Get('courses')
  courses(
    @Request() req: { user: { userId: string } },
    @Query('category') category?: ArticleCategory,
    @Query('status') status?: string,
    @Query('tier') tier?: string,
  ) {
    return this.learn.listCourses(req.user.userId, {
      category,
      status,
      tier: tier != null && tier !== '' ? parseInt(tier, 10) : undefined,
    });
  }

  @Get('courses/:id')
  course(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.learn.getCourse(req.user.userId, id);
  }

  @Post('courses/:id/start')
  startCourse(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.learn.startCourse(req.user.userId, id);
  }

  @Post('courses/:id/lessons/:lessonId/complete')
  completeLesson(
    @Request() req: { user: { userId: string } },
    @Param('id') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.learn.completeCourseLesson(req.user.userId, courseId, lessonId);
  }

  @Get('quizzes')
  listQuizzes(@Request() req: { user: { userId: string } }) {
    return this.quizzesService.listQuizzesWithUserState(req.user.userId);
  }
}

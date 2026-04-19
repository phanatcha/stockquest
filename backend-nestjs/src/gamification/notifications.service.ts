import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  listForUser(userId: string, take = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async markRead(userId: string, id: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!n) return null;
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}

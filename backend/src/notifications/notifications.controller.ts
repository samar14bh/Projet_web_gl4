import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseGuards,
  Sse,
  Request,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SseService } from '../sse/sse.service';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly sseService: SseService,
    private readonly notificationService: NotificationService,
  ) {}

  @Sse('sse')
  @UseGuards(JwtAuthGuard)
  sse(@Request() req: any): Observable<any> {
    const userId = req.user.sub; // Le JWT stocke l'ID dans 'sub'
    
    return this.sseService.addClient(userId).pipe(
      map(data => ({
        data: JSON.stringify(data),
      })),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@Request() req: any) {
    const userId = req.user.sub;
    const notifications = await this.notificationService.getUserNotifications(userId);
    
    return notifications.map(notification => ({
      ...notification,
      actionLink: notification.getActionLink(),
    }));
  }

  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.sub;
    return this.notificationService.getUnreadCount(userId);
  }

  @Post('mark-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.notificationService.markAsRead(parseInt(id), userId);
  }

  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.sub;
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('stream')
  @UseGuards(JwtAuthGuard)
  stream(@Request() req: any, @Res() res: Response) {
    const userId = req.user.sub;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const subscription = this.sseService.addClient(userId).subscribe({
      next: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      error: (err) => {
        console.error('SSE Error:', err);
        res.end();
      },
      complete: () => {
        res.end();
      }
    });

    req.on('close', () => {
      subscription.unsubscribe();
      this.sseService.removeClient(userId);
      res.end();
    });
  }
}
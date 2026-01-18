import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Sse,
  Request,
  MessageEvent,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SseService } from '../sse/sse.service';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseService: SseService
  ) {}

  // ✅ HELPER: Extraire userId du JWT de manière robuste
  private extractUserId(req: any): number {
    console.log('[Controller] 🔍 req.user complet:', JSON.stringify(req.user, null, 2));
    
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    
    console.log('[Controller] 🔍 userId extrait:', userId, 'type:', typeof userId);
    
    if (!userId) {
      console.error('[ERROR] userId introuvable dans req.user:', req.user);
      throw new Error('Authentication failed: userId not found in token');
    }
    
    const finalUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log('[Controller] ✅ userId final:', finalUserId);
    
    return finalUserId;
  }

  // ✅ ENDPOINT SSE - CORRECTION ICI
  @Sse('sse')
  @UseGuards(JwtAuthGuard)
  sse(@Request() req: any): Observable<MessageEvent> {
    // ❌ AVANT: const userId = req.user.sub;
    // ✅ APRÈS: Utiliser extractUserId pour gérer tous les cas
    const userId = this.extractUserId(req);
    
    console.log(`[SSE] 🚀 Nouvelle connexion SSE pour l'utilisateur ${userId}`);

    return this.sseService.addClient(userId).pipe(
      map((data) => ({
        data,
      }))
    );
  }

  @Post('test/:type')
  @UseGuards(JwtAuthGuard)
  async sendTest(@Param('type') type: string, @Request() req: any, @Body() body: any) {
    const userId = this.extractUserId(req);
    
    console.log(`[TEST] Type: ${type}, UserId: ${userId}, Body:`, body);

    switch (type) {
      case 'payment':
        return this.notificationService.sendPaymentNotification(userId, body);
      case 'club':
        return this.notificationService.sendClubNotification(userId, body.clubName || 'Club Test', body.action || 'acceptée');
      case 'event':
        return this.notificationService.sendEventNotification(userId, body.eventName || 'Événement Test');
      case 'custom':
        return this.notificationService.createNotification({
          userId,
          type: 'CUSTOM',
          description: body.message || 'Notification de test',
        });
      default:
        return { success: false, message: 'Type inconnu' };
    }
  }

  @Post('mark-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = this.extractUserId(req);
    return this.notificationService.markAsRead(parseInt(id, 10), userId);
  }

  // ✅ ENDPOINT MARK AS UNREAD
  @Post('mark-unread/:id')
  @UseGuards(JwtAuthGuard)
  async markAsUnread(@Param('id') id: string, @Request() req: any) {
    const userId = this.extractUserId(req);
    return this.notificationService.markAsUnread(parseInt(id, 10), userId);
  }

  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req: any) {
    const userId = this.extractUserId(req);
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@Request() req: any) {
    const userId = this.extractUserId(req);
    return this.notificationService.getUserNotifications(userId);
  }

  
  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req: any) {
    const userId = this.extractUserId(req);
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }
  @Post('send-to-user')
@UseGuards(JwtAuthGuard)
async sendToUser(@Body() body: any) {

  const { targetUserId, ...notificationData } = body;
  
  console.log(`[Controller]  Envoi d'une notification à l'utilisateur ${targetUserId}`);
  
  return this.notificationService.createNotification({
    ...notificationData,
    userId: targetUserId,
  });
}
}
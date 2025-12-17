import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SseService } from '../sse/sse.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private sseService: SseService,
  ) {}

  async createNotification(data: {
    userId: number;
    type: string;
    description: string;
    shortDescription?: string;
    actionUrl?: string;
    actionLabel?: string;
    iconName?: string;
    priority?: 'low' | 'medium' | 'high';
    relatedEntityType?: string;
    relatedEntityId?: number;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: data.userId },
      type: data.type,
      description: data.description,
      shortDescription: data.shortDescription || data.description.substring(0, 150),
      isRead: false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      iconName: data.iconName || this.getIconForType(data.type),
      priority: data.priority || 'medium',
      relatedEntityType: data.relatedEntityType,
      relatedEntityId: data.relatedEntityId,
      metadata: data.metadata,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedNotification = await this.notificationRepository.save(notification);

    const sseNotification = {
      id: savedNotification.id,
      type: savedNotification.type,
      description: savedNotification.description,
      shortDescription: savedNotification.shortDescription,
      isRead: savedNotification.isRead,
      actionUrl: savedNotification.actionUrl,
      actionLabel: savedNotification.actionLabel,
      iconName: savedNotification.iconName,
      priority: savedNotification.priority,
      createdAt: savedNotification.createdAt,
      relatedEntityType: savedNotification.relatedEntityType,
      relatedEntityId: savedNotification.relatedEntityId,
      actionLink: savedNotification.getActionLink(),
    };

    this.sseService.sendFormattedNotification(data.userId, {
      type: 'NEW_NOTIFICATION',
      notification: sseNotification,
    });

    return savedNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { 
        user: { id: userId },
        expiresAt: IsNull(),
      },
      order: { 
        priority: 'DESC',
        createdAt: 'DESC' 
      },
      take: 50,
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { 
        user: { id: userId },
        isRead: false,
        // Modification ici aussi
        expiresAt: IsNull(),
      },
    });
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { 
        id: notificationId,
        user: { id: userId }
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    
    const updatedNotification = await this.notificationRepository.save(notification);
    this.sseService.sendFormattedNotification(userId, {
      type: 'NOTIFICATION_READ',
      notificationId: notificationId,
      notification: updatedNotification,
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, updatedAt: new Date() }
    );
    
    // Notifier le client
    this.sseService.sendFormattedNotification(userId, {
      type: 'ALL_NOTIFICATIONS_READ',
    });
  }

  async getActiveUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: [
        { 
          user: { id: userId },
          expiresAt: IsNull() 
        },
        { 
          user: { id: userId },
          expiresAt: MoreThan(new Date()) 
        }
      ],
      order: { 
        priority: 'DESC',
        createdAt: 'DESC' 
      },
      take: 50,
    });
  }

  async cleanupExpiredNotifications(): Promise<void> {
    await this.notificationRepository.delete({
      expiresAt: IsNull() ? undefined : MoreThan(new Date())
    });
  }

  async sendPaymentNotification(userId: number, paymentDetails: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      description: `Paiement réussi de ${paymentDetails.amount}€ pour ${paymentDetails.item}`,
      shortDescription: `Paiement réussi: ${paymentDetails.amount}€`,
      actionUrl: '/my-payments',
      actionLabel: 'Voir mes paiements',
      iconName: 'check-circle',
      priority: 'high',
      relatedEntityType: 'payment',
      relatedEntityId: paymentDetails.id,
      metadata: paymentDetails,
    });
  }

  async sendClubNotification(userId: number, clubName: string, action: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'CLUB_ACTION',
      description: `Votre demande d'adhésion au club ${clubName} a été ${action}`,
      shortDescription: `Club ${clubName}: ${action}`,
      actionUrl: '/my-clubs',
      actionLabel: 'Voir mes clubs',
      iconName: 'users',
      relatedEntityType: 'club',
    });
  }

  async sendEventNotification(userId: number, eventName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'EVENT_REMINDER',
      description: `Rappel : L'événement "${eventName}" commence demain`,
      shortDescription: `Rappel: ${eventName}`,
      actionUrl: '/my-events',
      actionLabel: 'Voir l\'événement',
      iconName: 'calendar',
      relatedEntityType: 'event',
    });
  }

  private getIconForType(type: string): string {
    const iconMap: Record<string, string> = {
      'PAYMENT_SUCCESS': 'credit-card',
      'CLUB_ACTION': 'users',
      'EVENT_REMINDER': 'calendar',
      'NEW_MESSAGE': 'message-circle',
      'SYSTEM_ALERT': 'alert-circle',
      'ACHIEVEMENT': 'award',
    };
    return iconMap[type] || 'bell';
  }
}
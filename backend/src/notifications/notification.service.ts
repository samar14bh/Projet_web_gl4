import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SseService } from '../sse/sse.service';
import { Membership } from '../memberships/entities/membership.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private sseService: SseService,
  ) { }

  async createNotification(data: any): Promise<Notification> {
    if (!data.userId) {
      throw new Error("Impossible de créer une notification sans userId");
    }

    console.log('[NotificationService] Création notification pour userId:', data.userId);

    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      description: data.description,
      shortDescription: data.shortDescription || data.description.substring(0, 150),
      iconName: data.iconName || 'bell',
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      relatedEntityType: data.relatedEntityType,
      relatedEntityId: data.relatedEntityId,
      metadata: data.metadata,
      expiresAt: data.expiresAt,
      isRead: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    console.log(`[NotificationService] Notification créée avec succès, ID: ${savedNotification.id}`);

    // Envoi via SSE
    const sent = this.sseService.sendFormattedNotification(data.userId, {
      type: 'NEW_NOTIFICATION',
      notification: {
        id: savedNotification.id,
        userId: savedNotification.userId,
        type: savedNotification.type,
        description: savedNotification.description,
        shortDescription: savedNotification.shortDescription,
        iconName: savedNotification.iconName,
        priority: savedNotification.priority,
        isRead: savedNotification.isRead,
        createdAt: savedNotification.createdAt,
        updatedAt: savedNotification.updatedAt,
        actionUrl: savedNotification.actionUrl,
        actionLabel: savedNotification.actionLabel,
        actionLink: savedNotification.getActionLink(),
      },
    });

    console.log(`[NotificationService] SSE envoyé: ${sent ? 'OUI' : 'NON (client non connecté)'}`);

    return savedNotification;
  }

  /**
   * Créer des notifications pour plusieurs utilisateurs à la fois
   */
  async createNotifications(userIds: number[], data: any): Promise<Notification[]> {
    const results = await Promise.all(
      userIds.map(userId =>
        this.createNotification({ ...data, userId })
          .catch(err => {
            console.error(`[NotificationService] Error for user ${userId}:`, err);
            return null;
          })
      )
    );
    return results.filter(n => n !== null) as Notification[];
  }

  async sendClubNotification(userId: number, clubName: string, action: string) {
    console.log(`[NotificationService] sendClubNotification - userId: ${userId}, club: ${clubName}`);

    return this.createNotification({
      userId,
      type: 'CLUB_ACTION',
      description: `Votre demande pour le club ${clubName} a été ${action}`,
      iconName: 'users',
      priority: 'medium',
    });
  }

  async sendPaymentNotification(userId: number, data: any) {
    console.log(`[NotificationService] sendPaymentNotification - userId: ${userId}`);

    return this.createNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      description: data.description || `Paiement de ${data.amount}€ réussi pour : ${data.item}`,
      shortDescription: data.shortDescription,
      iconName: 'credit-card',
      priority: 'high',
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
    });
  }

  async sendEventNotification(userId: number, eventName: string) {
    console.log(`[NotificationService] sendEventNotification - userId: ${userId}`);

    return this.createNotification({
      userId,
      type: 'EVENT_REMINDER',
      description: `Rappel : l'événement "${eventName}" commence bientôt.`,
      iconName: 'calendar',
      priority: 'medium',
    });
  }

  /**
   * Notifier les administrateurs d'un club (Président, Trésorier, RH, etc.)
   */
  async notifyClubAdmins(clubId: number, roles: string[], data: any) {
    console.log(`[NotificationService] notifyClubAdmins - Club: ${clubId}, Roles: ${roles.join(', ')}`);

    const admins = await this.membershipRepository.find({
      where: {
        club: { id: clubId },
        role: In(roles),
      },
      relations: ['user'],
    });

    console.log(`[NotificationService] Found ${admins.length} admins to notify`);

    const notifications: Promise<Notification>[] = [];
    for (const admin of admins) {
      if (admin.user) {
        notifications.push(
          this.createNotification({
            ...data,
            userId: admin.user.id,
          })
        );
      }
    }

    return Promise.all(notifications);
  }

  async markAsUnread(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) throw new NotFoundException('Notification non trouvée');

    notification.isRead = false;
    const updated = await this.notificationRepository.save(notification);

    console.log(`[NotificationService] Notification ${notificationId} marquée comme non lue`);

    this.sseService.sendFormattedNotification(userId, {
      type: 'NOTIFICATION_UNREAD',
      notificationId: updated.id,
    });

    return updated;
  }

  async getUserNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    return this.notificationRepository.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) throw new NotFoundException('Notification non trouvée');

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    console.log(`[NotificationService] Notification ${id} marquée comme lue`);

    this.sseService.sendFormattedNotification(userId, {
      type: 'NOTIFICATION_READ',
      notificationId: id,
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );

    console.log(`[NotificationService] Toutes les notifications marquées comme lues pour userId ${userId}`);

    this.sseService.sendFormattedNotification(userId, {
      type: 'ALL_NOTIFICATIONS_READ',
    });
  }
}
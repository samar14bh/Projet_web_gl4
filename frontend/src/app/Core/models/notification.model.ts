export interface Notification {
  id: number;
  type: string;
  description: string;
  shortDescription: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionLink?: string;
  iconName: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date | string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  type: string;
  notification?: Notification;
  notificationId?: number;
}

export interface UnreadCountResponse {
  count: number;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { SseService } from 'src/sse/sse.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationService, SseService],
  exports: [NotificationService],
})
export class NotificationsModule {}
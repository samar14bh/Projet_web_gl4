import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubManagerService } from './club-manager.service';
import { ClubManagerController } from './club-manager.controller';
import { Club } from '../clubs/entities/club.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Membership])],
  controllers: [ClubManagerController],
  providers: [ClubManagerService],
  exports: [ClubManagerService],
})
export class ClubManagerModule {}

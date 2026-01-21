import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { Membership } from './entities/membership.entity';
import { Application } from './entities/application.entity';

/**
 * Module de Gestion des Adhésions
 *
 * DÉPENDANCES:
 * - Membership: Enregistre les adhésions effectives
 * - Application: Enregistre les demandes d'adhésion avec leur statut
 *
 * LOGIQUE:
 * - Les applications contiennent le statut (PENDING, APPROVED, REJECTED)
 * - Les memberships enregistrent l'adhésion effective
 * - Une membership est créée quand une application est APPROVED
 * - Une membership est supprimée quand une application est REJECTED
 */
@Module({
  imports: [TypeOrmModule.forFeature([Membership, Application])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}

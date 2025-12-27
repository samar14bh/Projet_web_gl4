import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { CategoriesController } from './categories.controller';
import { Club } from './entities/club.entity';
import { Category } from './entities/category.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Event } from '../events/entities/event.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
<<<<<<< HEAD
import {MembershipsController} from "./memberships.controller";
import {MembershipsService} from "./memberships.service";
import {Application} from "../memberships/entities/application.entity";
import {User} from "../users/entities/user.entity";
=======
import { Application } from 'src/memberships/entities/application.entity';
>>>>>>> origin/main

/**
 * Module pour la gestion des clubs et catégories
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      Category,
      Membership,
      Event,
      Transaction,
<<<<<<< HEAD
        Application,
        User
=======
      Application
>>>>>>> origin/main
    ]),
  ],
  controllers: [ClubsController, CategoriesController,MembershipsController],
  providers: [ClubsService,MembershipsService],
  exports: [ClubsService],
})
export class ClubsModule {}

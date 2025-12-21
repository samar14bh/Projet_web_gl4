import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../../../memberships/entities/membership.entity';
import { GeneralUser } from '../../../users/entities/general-user.entity';
import { Club } from '../../../clubs/entities/club.entity';
import { MemberRole } from '../../../common/enums';

@Injectable()
export class MembershipSeeder {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) { }

  async seed(users: GeneralUser[], clubs: Club[]): Promise<Membership[]> {
    const memberships: any[] = [];

    // Fonction helper pour trouver un user par email
    const findUser = (email: string) => users.find((u: any) => u.email === email);

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
    const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, now.getDate());
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const sixMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    const sevenMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 7, now.getDate());
    const eightMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 8, now.getDate());
    const nineMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 9, now.getDate());
    const tenMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 10, now.getDate());
    const elevenMonthsFuture = new Date(now.getFullYear(), now.getMonth() + 11, now.getDate());

    // ========== CLUB TECH INNOVATION (ID 1) - 8 MEMBRES ==========
    memberships.push(
      { user: findUser('ahmed.benali@insat.tn'), club: clubs[0], dateDebut: sixMonthsAgo, dateFin: sixMonthsFuture, role: MemberRole.PRESIDENT },
      { user: findUser('sarah.mansour@insat.tn'), club: clubs[0], dateDebut: fiveMonthsAgo, dateFin: sevenMonthsFuture, role: MemberRole.TREASURER },
      { user: findUser('youssef.trabelsi@insat.tn'), club: clubs[0], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.SECRETARY },
      { user: findUser('mariem.khelifi@insat.tn'), club: clubs[0], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('karim.hamdi@insat.tn'), club: clubs[0], dateDebut: twoMonthsAgo, dateFin: tenMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('sami.ghribi@insat.tn'), club: clubs[0], dateDebut: twoMonthsAgo, dateFin: tenMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('leila.oueslati@insat.tn'), club: clubs[0], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('hamza.ben.youssef@insat.tn'), club: clubs[0], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.RH },
    );

    // ========== CLUB BUSINESS & ENTREPRENEURIAT (ID 2) - 5 MEMBRES ==========
    memberships.push(
      { user: findUser('fatma.ben.salem@insat.tn'), club: clubs[1], dateDebut: fiveMonthsAgo, dateFin: sevenMonthsFuture, role: MemberRole.PRESIDENT },
      { user: findUser('mohamed.gharbi@insat.tn'), club: clubs[1], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.TREASURER },
      { user: findUser('amira.jlassi@insat.tn'), club: clubs[1], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('ines.ben.amor@insat.tn'), club: clubs[1], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('ali.ben.mohamed@insat.tn'), club: clubs[1], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.MEMBER },
    );

    // ========== CLUB ARTS & CULTURE (ID 3) - 4 MEMBRES ==========
    memberships.push(
      { user: findUser('rami.bouaziz@insat.tn'), club: clubs[2], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.PRESIDENT },
      { user: findUser('nour.chebbi@insat.tn'), club: clubs[2], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.SECRETARY },
      { user: findUser('ahmed.benali@insat.tn'), club: clubs[2], dateDebut: twoMonthsAgo, dateFin: tenMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('mariem.khelifi@insat.tn'), club: clubs[2], dateDebut: fiveMonthsAgo, dateFin: sevenMonthsFuture, role: MemberRole.MEMBER },
    );

    // ========== CLUB SPORT & SANTÉ (ID 4) - 6 MEMBRES ==========
    memberships.push(
      { user: findUser('sarah.mansour@insat.tn'), club: clubs[3], dateDebut: sixMonthsAgo, dateFin: sixMonthsFuture, role: MemberRole.PRESIDENT },
      { user: findUser('youssef.trabelsi@insat.tn'), club: clubs[3], dateDebut: fiveMonthsAgo, dateFin: sevenMonthsFuture, role: MemberRole.TREASURER },
      { user: findUser('karim.hamdi@insat.tn'), club: clubs[3], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('fatma.ben.salem@insat.tn'), club: clubs[3], dateDebut: threeMonthsAgo, dateFin: nineMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('sami.ghribi@insat.tn'), club: clubs[3], dateDebut: twoMonthsAgo, dateFin: tenMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('leila.oueslati@insat.tn'), club: clubs[3], dateDebut: oneMonthAgo, dateFin: elevenMonthsFuture, role: MemberRole.MEMBER },
    );

    // ========== MEMBERSHIPS HISTORIQUES ==========
    memberships.push(
      { user: findUser('ali.ben.mohamed@insat.tn'), club: clubs[0], dateDebut: sixMonthsAgo, dateFin: sixMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('ines.ben.amor@insat.tn'), club: clubs[2], dateDebut: fiveMonthsAgo, dateFin: sevenMonthsFuture, role: MemberRole.MEMBER },
      { user: findUser('hamza.ben.youssef@insat.tn'), club: clubs[1], dateDebut: fourMonthsAgo, dateFin: eightMonthsFuture, role: MemberRole.MEMBER },
    );

    // ========== DEMANDES EN ATTENTE (PENDING) ==========
    memberships.push(
      { user: findUser('rami.bouaziz@insat.tn'), club: clubs[0], dateDebut: now, dateFin: null, role: MemberRole.MEMBER, status: 'PENDING' },
      { user: findUser('nour.chebbi@insat.tn'), club: clubs[0], dateDebut: now, dateFin: null, role: MemberRole.MEMBER, status: 'PENDING' },
      { user: findUser('amira.jlassi@insat.tn'), club: clubs[0], dateDebut: now, dateFin: null, role: MemberRole.MEMBER, status: 'PENDING' },
      { user: findUser('mohamed.gharbi@insat.tn'), club: clubs[1], dateDebut: now, dateFin: null, role: MemberRole.MEMBER, status: 'PENDING' },
      { user: findUser('karim.hamdi@insat.tn'), club: clubs[2], dateDebut: now, dateFin: null, role: MemberRole.MEMBER, status: 'PENDING' },
    );

    // Créer tous les memberships
    const createdMemberships = this.membershipRepository.create(memberships);
    const savedMemberships = await this.membershipRepository.save(createdMemberships);

    return savedMemberships;
  }
}

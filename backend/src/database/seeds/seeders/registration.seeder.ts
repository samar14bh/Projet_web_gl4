import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../../../events/entities/registration.entity';
import { RegistrationStatus } from '../../../common/enums/registration-status.enum';
import { Event } from '../../../events/entities/event.entity';
import { GeneralUser } from '../../../users/entities/general-user.entity';

@Injectable()
export class RegistrationSeeder {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
  ) {}

  async seed(events: Event[], users: GeneralUser[]): Promise<Registration[]> {
    // Créer quelques inscriptions pour les événements à venir
    const registrations: any[] = [];
    const regularUsers = users.filter((u: any) => u.type === 'user');

    if (regularUsers.length === 0 || events.length === 0) {
      console.warn('⚠️ No users or events found, skipping registrations');
      return [];
    }

    // Prendre les 3 premiers événements à venir
    const upcomingEvents = events.filter((e) => e.status === 'UPCOMING').slice(0, 3);

    for (const event of upcomingEvents) {
      // Inscrire 5 utilisateurs à chaque événement
      const usersToRegister = regularUsers.slice(0, 5);

      for (let i = 0; i < usersToRegister.length; i++) {
        const user = usersToRegister[i];
        registrations.push({
          event: event,
          user: user,
          date: new Date(),
          status: RegistrationStatus.REGISTERED,
          qrCode: `EVENT-${event.id}-USER-${user.id}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          isPresent: false,
          scannedAt: null,
        });
      }
    }

    if (registrations.length === 0) {
      return [];
    }

    const createdRegistrations = this.registrationRepository.create(registrations);
    const savedRegistrations = await this.registrationRepository.save(createdRegistrations);

    return savedRegistrations;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralUser } from '../../../users/entities/general-user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(GeneralUser)
    private readonly generalUserRepository: Repository<GeneralUser>,
  ) {}

  async seed(): Promise<GeneralUser[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersToCreate: any[] = [];

    // Créer 1 admin
    usersToCreate.push({
      email: 'admin@insat.tn',
      password: hashedPassword,
      type: 'admin',
      name: 'Admin',
      lastName: 'INSAT',
    });

    // Liste exacte des utilisateurs du script SQL
    const users = [
      { email: 'ahmed.benali@insat.tn', name: 'Ahmed', lastName: 'Ben Ali', major: 'GL', dateOfBirth: '2002-03-15' },
      { email: 'sarah.mansour@insat.tn', name: 'Sarah', lastName: 'Mansour', major: 'RT', dateOfBirth: '2003-07-22' },
      { email: 'youssef.trabelsi@insat.tn', name: 'Youssef', lastName: 'Trabelsi', major: 'IMI', dateOfBirth: '2002-11-08' },
      { email: 'mariem.khelifi@insat.tn', name: 'Mariem', lastName: 'Khelifi', major: 'GL', dateOfBirth: '2003-01-30' },
      { email: 'karim.hamdi@insat.tn', name: 'Karim', lastName: 'Hamdi', major: 'IIA', dateOfBirth: '2002-09-12' },
      { email: 'fatma.ben.salem@insat.tn', name: 'Fatma', lastName: 'Ben Salem', major: 'BIO', dateOfBirth: '2003-05-18' },
      { email: 'mohamed.gharbi@insat.tn', name: 'Mohamed', lastName: 'Gharbi', major: 'CH', dateOfBirth: '2002-12-25' },
      { email: 'amira.jlassi@insat.tn', name: 'Amira', lastName: 'Jlassi', major: 'GL', dateOfBirth: '2003-04-10' },
      { email: 'rami.bouaziz@insat.tn', name: 'Rami', lastName: 'Bouaziz', major: 'RT', dateOfBirth: '2002-08-05' },
      { email: 'nour.chebbi@insat.tn', name: 'Nour', lastName: 'Chebbi', major: 'IMI', dateOfBirth: '2003-02-14' },
      { email: 'sami.ghribi@insat.tn', name: 'Sami', lastName: 'Ghribi', major: 'GL', dateOfBirth: '2002-06-20' },
      { email: 'leila.oueslati@insat.tn', name: 'Leila', lastName: 'Oueslati', major: 'IIA', dateOfBirth: '2003-09-08' },
      { email: 'hamza.ben.youssef@insat.tn', name: 'Hamza', lastName: 'Ben Youssef', major: 'BIO', dateOfBirth: '2002-10-17' },
      { email: 'ines.ben.amor@insat.tn', name: 'Ines', lastName: 'Ben Amor', major: 'CH', dateOfBirth: '2003-03-22' },
      { email: 'ali.ben.mohamed@insat.tn', name: 'Ali', lastName: 'Ben Mohamed', major: 'RT', dateOfBirth: '2002-07-11' },
    ];

    for (const user of users) {
      usersToCreate.push({
        email: user.email,
        password: hashedPassword,
        type: 'user',
        name: user.name,
        lastName: user.lastName,
        major: user.major,
        dateOfBirth: new Date(user.dateOfBirth),
      });
    }

    const createdUsers = this.generalUserRepository.create(usersToCreate);
    const savedUsers = await this.generalUserRepository.save(createdUsers);

    return savedUsers;
  }
}

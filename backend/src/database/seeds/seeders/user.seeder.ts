import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralUser } from '../../../users/entities/general-user.entity';
import { Admin } from '../../../users/entities/admin.entity';
import { User } from '../../../users/entities/user.entity';
import { StudyMajor } from '../../../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(GeneralUser)
    private readonly generalUserRepository: Repository<GeneralUser>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<GeneralUser[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const createdUsers: GeneralUser[] = [];

    // Créer 1 admin en utilisant le repository Admin
    const adminData = {
      email: 'admin@insat.tn',
      password: hashedPassword,
    };
    const admin = this.adminRepository.create(adminData);
    const savedAdmin = await this.adminRepository.save(admin);
    createdUsers.push(savedAdmin);

    // Liste exacte des utilisateurs du script SQL
    const users = [
      { email: 'ahmed.benali@insat.tn', name: 'Ahmed', lastName: 'Ben Ali', major: StudyMajor.GL, dateOfBirth: '2002-03-15' },
      { email: 'sarah.mansour@insat.tn', name: 'Sarah', lastName: 'Mansour', major: StudyMajor.RT, dateOfBirth: '2003-07-22' },
      { email: 'youssef.trabelsi@insat.tn', name: 'Youssef', lastName: 'Trabelsi', major: StudyMajor.IMI, dateOfBirth: '2002-11-08' },
      { email: 'mariem.khelifi@insat.tn', name: 'Mariem', lastName: 'Khelifi', major: StudyMajor.GL, dateOfBirth: '2003-01-30' },
      { email: 'karim.hamdi@insat.tn', name: 'Karim', lastName: 'Hamdi', major: StudyMajor.IIA, dateOfBirth: '2002-09-12' },
      { email: 'fatma.ben.salem@insat.tn', name: 'Fatma', lastName: 'Ben Salem', major: StudyMajor.BIO, dateOfBirth: '2003-05-18' },
      { email: 'mohamed.gharbi@insat.tn', name: 'Mohamed', lastName: 'Gharbi', major: StudyMajor.CH, dateOfBirth: '2002-12-25' },
      { email: 'amira.jlassi@insat.tn', name: 'Amira', lastName: 'Jlassi', major: StudyMajor.GL, dateOfBirth: '2003-04-10' },
      { email: 'rami.bouaziz@insat.tn', name: 'Rami', lastName: 'Bouaziz', major: StudyMajor.RT, dateOfBirth: '2002-08-05' },
      { email: 'nour.chebbi@insat.tn', name: 'Nour', lastName: 'Chebbi', major: StudyMajor.IMI, dateOfBirth: '2003-02-14' },
      { email: 'sami.ghribi@insat.tn', name: 'Sami', lastName: 'Ghribi', major: StudyMajor.GL, dateOfBirth: '2002-06-20' },
      { email: 'leila.oueslati@insat.tn', name: 'Leila', lastName: 'Oueslati', major: StudyMajor.IIA, dateOfBirth: '2003-09-08' },
      { email: 'hamza.ben.youssef@insat.tn', name: 'Hamza', lastName: 'Ben Youssef', major: StudyMajor.BIO, dateOfBirth: '2002-10-17' },
      { email: 'ines.ben.amor@insat.tn', name: 'Ines', lastName: 'Ben Amor', major: StudyMajor.CH, dateOfBirth: '2003-03-22' },
      { email: 'ali.ben.mohamed@insat.tn', name: 'Ali', lastName: 'Ben Mohamed', major: StudyMajor.RT, dateOfBirth: '2002-07-11' },
    ];

    // Créer les users en utilisant le repository User
    for (const userData of users) {
      const user = this.userRepository.create({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        lastName: userData.lastName,
        major: userData.major,
        dateOfBirth: new Date(userData.dateOfBirth),
        emailVerified:true
      });
      const savedUser = await this.userRepository.save(user);
      createdUsers.push(savedUser as GeneralUser);
    }

    return createdUsers;
  }
}

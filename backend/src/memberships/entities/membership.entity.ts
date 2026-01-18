import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';
import { MemberRole } from '../../common/enums';
import { Application } from './application.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Status } from '../../common/enums';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'date', name: 'date_fin', nullable: true })
  dateFin: Date;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;



  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Club, (club) => club.memberships)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => Application, (application) => application.membership)
  applications: Application[];

  @OneToMany(() => Payment, (payment) => payment.membership)
  payments: Payment[];
}

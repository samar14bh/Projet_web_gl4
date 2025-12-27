import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membership } from './membership.entity';
import { Status } from '../../common/enums';
import { Club } from 'src/clubs/entities/club.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ type: 'text', name: 'why_join' })
  whyJoin: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'previous_club' })
  previousClub: string;

  @Column({ type: 'text', name: 'goals_in_club' })
  goalsInClub: string;

  @Column({ type: 'varchar', length: 20, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  expectations: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  availability: string;

  @Column({ type: 'text', nullable: true, name: 'additional_comments' })
  additionalComments: string;

  @Column({ type: 'boolean', name: 'is_member_of_other_club', default: false })
  isMemberOfOtherClub: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membership, (membership) => membership.applications, { nullable: true })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;


  @ManyToOne(() => Club, { nullable: false })
  @JoinColumn({ name: 'club_id' })
  club: Club;

}

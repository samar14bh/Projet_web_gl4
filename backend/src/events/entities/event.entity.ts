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
import { Club } from '../../clubs/entities/club.entity';
import { EventStatus, EventType } from '../../common/enums';
import { Registration } from './registration.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ type: 'datetime', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'datetime', name: 'end_date' })
  endDate: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ name: 'member_only', default: false })
  memberOnly: boolean;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
    name: 's_paid',
  })
  sPaid: EventType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'subscription_fees',
  })
  subscriptionFees: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.events)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  @OneToMany(() => Payment, (payment) => payment.event)
  payments: Payment[];
}

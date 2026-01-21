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
import { Membership } from '../../memberships/entities/membership.entity';
import { Event } from '../../events/entities/event.entity';
import { PaymentStatus, PaymentType } from '../../common/enums';
import { PaymentMethod } from '../../common/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: {
      to: (value: number | string | null) => value,
      from: (value: any) => {
        // Convertir le résultat de la BD en nombre JavaScript
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value);
        if (value?.toNumber) return value.toNumber();
        if (value?._d !== undefined) return parseFloat(value._d);
        return parseFloat(String(value));
      }
    }})
  amount: number;

  @Column()
  date: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  method: PaymentMethod;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membership, (membership) => membership.payments, { nullable: true })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @ManyToOne(() => Event, (event) => event.payments, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
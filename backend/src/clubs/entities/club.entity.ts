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
import { Category } from './category.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Event } from '../../events/entities/event.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'contact_email' })
  contactEmail: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({
    name: 'membership_fee_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  membershipFeeAmount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'approval_required', default: true, nullable: true })
  approvalRequired: boolean;

  @Column({ type: 'date', name: 'creation_date' })
  creationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.clubs)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Membership, (membership) => membership.club)
  memberships: Membership[];

  @OneToMany(() => Event, (event) => event.club)
  events: Event[];

  @OneToMany(() => Document, (document) => document.club)
  documents: Document[];
}

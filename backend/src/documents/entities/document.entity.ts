import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { User } from "../../users/entities/user.entity";

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  file: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;


  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Club, (club) => club.documents)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

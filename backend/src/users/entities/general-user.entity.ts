import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  TableInheritance,
} from 'typeorm';

@Entity('general_users')
@TableInheritance({ column: { type: 'varchar', name: 'type', length: 191 } }) 
export class GeneralUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true}) 
  email: string;

  @Column() 
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  
}
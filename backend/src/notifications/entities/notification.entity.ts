import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shortDescription: string;

  @Column({ 
    default: false, 
    name: 'is_read' 
  })
  isRead: boolean;

  @Column({
    name: 'action_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  actionUrl: string;

  @Column({
    name: 'action_label',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  actionLabel: string;

  @Column({
    name: 'icon_name',
    type: 'varchar',
    length: 50,
    default: 'bell',
  })
  iconName: string;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @Column({
    name: 'related_entity_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  relatedEntityType: string;

  @Column({
    name: 'related_entity_id',
    type: 'int',
    nullable: true,
  })
  relatedEntityId: number;

  @Column({
    name: 'metadata',
    type: 'json',
    nullable: true,
  })
  metadata: Record<string, any>;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;

  @Column({ 
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({ 
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  // ✅ CORRECTION: Relation ManyToOne avec User
  @ManyToOne(() => User, (user) => user.notifications, { 
    onDelete: 'CASCADE',
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // ✅ Méthode helper pour générer le lien d'action
  getActionLink(): string | null {
    if (!this.actionUrl) return null;
    
    if (this.relatedEntityId && this.actionUrl.includes(':id')) {
      return this.actionUrl.replace(':id', this.relatedEntityId.toString());
    }
    
    return this.actionUrl;
  }
}
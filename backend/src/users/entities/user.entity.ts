import { Column, OneToMany, ChildEntity } from 'typeorm';
import { GeneralUser } from './general-user.entity';
import { StudyMajor } from '../../common/enums';
import { Membership } from '../../memberships/entities/membership.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Application } from '../../memberships/entities/application.entity';
import { Registration } from '../../events/entities/registration.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@ChildEntity()
export class User extends GeneralUser {
  @Column()
  name: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: StudyMajor,
  })
  major: StudyMajor;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  // Relations
  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  @OneToMany(() => Registration, (registration) => registration.user)
  registrations: Registration[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'email_verification_token', length: 255 })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verification_expires' })
  emailVerificationExpires: Date | null;




}

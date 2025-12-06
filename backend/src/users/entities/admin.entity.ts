import { ChildEntity } from 'typeorm';
import { GeneralUser } from './general-user.entity';

@ChildEntity()
export class Admin extends GeneralUser {}

import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { MemberRole } from '../../common/enums';

export class CreateMembershipDto {
  @IsDateString()
  @IsNotEmpty()
  dateDebut: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  clubId: number;
}

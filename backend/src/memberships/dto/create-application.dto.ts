import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Status } from '../../common/enums';

export class CreateApplicationDto {
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsString()
  @IsOptional()
  response?: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  clubId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Veuillez expliquer en au moins 50 caractères pourquoi vous souhaitez rejoindre ce club' })
  @MaxLength(1000)
  whyJoin: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  previousClub?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(30, { message: 'Veuillez décrire vos objectifs en au moins 30 caractères' })
  @MaxLength(1000)
  goalsInClub: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{8,20}$/, { message: 'Numéro de téléphone invalide (8-20 chiffres)' })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skills?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  expectations?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  availability?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  additionalComments?: string;

  @IsBoolean()
  @IsOptional()
  isMemberOfOtherClub?: boolean;



}

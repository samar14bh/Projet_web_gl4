import { IsString, IsEnum, IsDateString, IsOptional, MinLength } from 'class-validator';
import { StudyMajor } from 'src/common/enums/study-major.enum';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(StudyMajor)
  major?: StudyMajor;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password?: string;
}
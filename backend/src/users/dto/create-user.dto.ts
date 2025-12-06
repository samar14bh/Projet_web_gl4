import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsDateString } from 'class-validator';
import { StudyMajor } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(StudyMajor)
  @IsNotEmpty()
  major: StudyMajor;

  @IsString()
  image?: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;
}

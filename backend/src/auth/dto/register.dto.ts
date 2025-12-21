import { IsEmail, IsString, IsEnum, IsDateString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { StudyMajor } from 'src/common/enums';


export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
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

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @IsOptional()
  @IsString()
  image?: string; 
}
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  membershipFeeAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsNotEmpty()
  creationDate: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}

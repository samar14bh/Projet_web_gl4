import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { EventStatus, EventType } from '../../common/enums';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsBoolean()
  @IsOptional()
  memberOnly?: boolean;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsEnum(EventType)
  @IsOptional()
  sPaid?: EventType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  subscriptionFees?: number;

  @IsNumber()
  @IsNotEmpty()
  clubId: number;
}

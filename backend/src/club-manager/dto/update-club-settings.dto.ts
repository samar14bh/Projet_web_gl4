import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateClubSettingsDto {
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  membershipFeeAmount?: number;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;
}

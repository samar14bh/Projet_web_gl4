import { IsEnum, IsOptional } from 'class-validator';
import {MemberRole} from "../../common/enums";

export class AssignRoleDto {
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;
}

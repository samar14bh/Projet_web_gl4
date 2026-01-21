import {MemberRole} from "../../common/enums";

export class MemberResponseDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: MemberRole;
  joinDate: string;
  endDate?: string;
  image?: string;
  status: string;
}

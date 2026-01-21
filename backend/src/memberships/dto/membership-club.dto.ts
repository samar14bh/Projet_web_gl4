import { MemberRole } from '../../common/enums/member-role.enum';

export class MembershipClubDto {
    id: number;
    name: string;
    description: string;
    logo: string;
    userRole: MemberRole;
    membershipId: number;
    dateDebut: Date;
}

export enum UserRoleInClub {
  PRESIDENT = 'PRESIDENT',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER',
  RH = 'RH',

}
export interface MembershipClubDto {
  id: number;
  name: string;
  description: string;
  logo: string;
  userRole: UserRoleInClub;
  membershipId: number;
  dateDebut: Date;
}

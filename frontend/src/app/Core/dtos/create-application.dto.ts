export interface CreateApplicationDto {
  userId: number;
  clubId: number;
  whyJoin: string;
  previousClub?: string;
  goalsInClub: string;
  phoneNumber: string;
  skills?: string;
  expectations?: string;
  availability?: string;
  additionalComments?: string;
  isMemberOfOtherClub?: boolean;
}

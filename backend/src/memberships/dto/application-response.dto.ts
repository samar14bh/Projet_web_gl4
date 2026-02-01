export class ApplicationResponseDto {
  id: number;
  status: string;
  adminResponse?: string;

  whyJoin: string;
  previousClub?: string;
  goalsInClub: string;
  phoneNumber: string;
  skills?: string;
  expectations?: string;
  availability?: string;
  additionalComments?: string;
  isMemberOfOtherClub: boolean;

  userId: number;
  userName: string;
  userEmail: string;

  clubId: number;
  clubName: string;

  createdAt: Date;
  updatedAt: Date;
}


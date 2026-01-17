export class UpcomingEventDto {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  address?: string;
  clubName: string;
  clubLogo?: string;
  subscriptionFees: number;
  registrationStatus: string;
  paymentStatus: string;
  formattedDate?: string;
  formattedTime?: string;
  isFree?: boolean;
}

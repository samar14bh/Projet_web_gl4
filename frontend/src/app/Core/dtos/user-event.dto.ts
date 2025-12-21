import {EventStatus, RegistrationStatus,EventType} from '../models/event.model';


export interface UserEventDto {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  address?: string;
  memberOnly: boolean;


  status: EventStatus;
  type: EventType;
  subscriptionFees: number;


  club: {
    id: number;
    name: string;
  };

  userRegistration: {
    id: number;
    status: RegistrationStatus;
    isPresent: boolean;
    registeredAt: Date;
  } | null;

  paymentStatus: 'paid' | 'pending' | null;
  attendanceStatus: 'present' | 'absent' | null;
  canCancel: boolean;
}

import { EventStatus, EventType } from '../../common/enums';

export class UserEventDto {
    id: number;
    title: string;
    description: string | null;
    coverImage: string | null;

    startDate: Date;
    endDate: Date;
    address: string | null;

    status: EventStatus;
    type: EventType;
    subscriptionFees: number;

    club: {
        id: number;
        name: string;
    };

    userRegistration: {
        id: number;
        status: string;
        isPresent: boolean;
        registeredAt: Date;
    } | null;

    paymentStatus: 'paid' | 'pending' | null;
    attendanceStatus: 'present' | 'absent' | null;
    canCancel: boolean;
}

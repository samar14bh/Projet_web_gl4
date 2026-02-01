import { Event } from '../entities/event.entity';
import { UserEventDto } from '../dto/user-event.dto';
import { EventStatus, RegistrationStatus, PaymentStatus, PaymentType } from '../../common/enums';

export class EventMapper {
    static toUserEventDto(event: Event, userId: number): UserEventDto {
        const userReg = event.registrations?.find(
            (r) => r.user?.id === userId && r.status !== RegistrationStatus.CANCELLED
        );

        const now = new Date();
        const isPast = event.endDate < now;

        const paymentStatus =
            event.subscriptionFees > 0 && userReg
                ? userReg.status === RegistrationStatus.PAID
                    ? 'paid'
                    : 'pending'
                : null;

        const attendanceStatus =
            isPast && userReg
                ? userReg.isPresent
                    ? 'present'
                    : 'absent'
                : null;

        const canCancel =
            !!userReg &&
            event.startDate > now &&
            event.status !== EventStatus.CANCELLED;

        const payment = event.payments?.find(
            (p) => p.user?.id === userId && p.status === PaymentStatus.CONFIRMED && p.type === PaymentType.EVENT
        );

        return {
            id: event.id,
            title: event.title,
            description: event.description,
            coverImage: event.coverImage,
            startDate: event.startDate,
            endDate: event.endDate,
            address: event.address,
            status: event.status,
            type: event.sPaid,
            subscriptionFees: event.subscriptionFees,
            club: {
                id: event.club.id,
                name: event.club.name,
            },
            userRegistration: userReg
                ? {
                    id: userReg.id,
                    status: userReg.status,
                    isPresent: userReg.isPresent,
                    registeredAt: userReg.createdAt,
                }
                : null,
            paymentStatus,
            paymentId: payment ? payment.id : null,
            attendanceStatus,
            canCancel,
        };
    }
}

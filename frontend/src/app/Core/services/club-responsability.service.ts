import { Injectable, signal } from '@angular/core';
import { MembershipClubDto } from '../dtos/membership-club.dto';


@Injectable({ providedIn: 'root' })
export class ClubResponsabilityService {
    private _club = signal<MembershipClubDto | null>(null);

    club = this._club.asReadonly();

    setClub(club: MembershipClubDto) {
        this._club.set(club);
    }

    clear() {
        this._club.set(null);
    }
}

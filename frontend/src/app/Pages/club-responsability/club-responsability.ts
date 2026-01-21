import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MembershipClubDto, UserRoleInClub } from '../../Core/dtos/membership-club.dto';
import { ClubResponsabilityService } from '../../Core/services/club-responsability.service';
import { ClubService } from '../../Core/services/club.service';
import { AuthService } from '../../Core/services/auth.service';


@Component({
  selector: 'app-club-responsability',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './club-responsability.html',
  styleUrl: './club-responsability.css',
})
export class ClubResponsability {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clubResponsabilityService = inject(ClubResponsabilityService);
  private clubService = inject(ClubService);
  private authService = inject(AuthService);

  club = this.clubResponsabilityService.club;

  protected readonly UserRole = UserRoleInClub;

  constructor() {
    console.log("in the constructor");

    this.route.paramMap.subscribe(params => {
      console.log("this was called ")
      const membershipId = params.get('membershipId');
      const currentUser = this.authService.currentUser();
      console.log("membership id is ", membershipId);

      if (membershipId && (!this.club() || this.club()?.membershipId !== Number(membershipId)) ) {
        console.log("we are now here ")
        this.clubService.getClubsWithSpecialMemberships(1).subscribe({
          next: (clubs) => {
            console.log("all clubs",clubs);
            const foundClub = clubs.find(c => c.membershipId === Number(membershipId));
            if (foundClub) {
              this.clubResponsabilityService.setClub(foundClub);
            }
            console.log("found club",foundClub);
          },
          error: (err) => {
            console.error('Erreur lors de la récupération du club:', err);
          }
        });
      }
    });
  }


  hasRole(roles: UserRoleInClub[]): boolean {
    const userRole = this.club()?.userRole;
    return userRole ? roles.includes(userRole) : false;
  }
}

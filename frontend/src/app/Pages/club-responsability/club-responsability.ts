import { Component, inject, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRoleInClub } from '../../Core/dtos/application/membership-club.dto';
import { MembershipService } from '../../Core/services/membership.service';

@Component({
  selector: 'app-club-responsability',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './club-responsability.html',
  styleUrl: './club-responsability.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubResponsability {
  private readonly membershipService = inject(MembershipService);

  membershipId = input.required({
    transform: (val: string | number) => Number(val)
  });

  protected readonly UserRole = UserRoleInClub;

  membership = this.membershipService.getMembership(this.membershipId);

  canManageDashboard = computed(() => this.hasRole([UserRoleInClub.PRESIDENT, UserRoleInClub.SECRETARY, UserRoleInClub.TREASURER, UserRoleInClub.RH]));
  canManageDocuments = computed(() => this.hasRole([UserRoleInClub.PRESIDENT, UserRoleInClub.SECRETARY]));
  canManageFinances = computed(() => this.hasRole([UserRoleInClub.PRESIDENT, UserRoleInClub.TREASURER]));
  canManageMembers = computed(() => this.hasRole([UserRoleInClub.PRESIDENT, UserRoleInClub.RH]));
  isPresident = computed(() => this.hasRole([UserRoleInClub.PRESIDENT]));

  hasRole(roles: UserRoleInClub[]): boolean {
    const userRole = this.membership()?.userRole;
    return userRole ? roles.includes(userRole) : false;
  }
}

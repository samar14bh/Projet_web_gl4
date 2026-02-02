import { Component, computed, inject, resource, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../Core/services/club.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { Loader } from '../../shared/components/loader/loader';
import { Error as AppError } from '../../shared/components/error/error';
import { Club } from '../../Core/models/club.model';
import { DefaultImagePipe } from "../../shared/pipes/default-image.pipe";

import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, Loader, AppError, DefaultImagePipe, RouterModule],
  templateUrl: './user-clubs.html',
  styleUrl: './user-clubs.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserClubs {
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly pageSize = 3;
  readonly Math = Math;

  readonly currentPage = signal(1);
  readonly searchQuery = signal('');

  readonly clubsResource = resource({
    params: () => ({
      userId: Number(this.authService.currentUser()?.id ?? 0),
      page: this.currentPage(),
      limit: this.pageSize,
      search: this.searchQuery(),
    }),
    loader: async ({ params }) => {
      try {
        return (await firstValueFrom(this.clubService.getUserClubs(params.userId, {
          page: params.page,
          limit: params.limit,
          search: params.search,
        }))) ?? this.emptyResult();
      } catch {
        return this.emptyResult();
      }
    }
  });

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  private emptyResult() {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: this.pageSize,
      totalPages: 0,
    };
  }



  goToClub(clubId: number) {
    this.router.navigate(['/my-clubs', clubId]);
  }
}


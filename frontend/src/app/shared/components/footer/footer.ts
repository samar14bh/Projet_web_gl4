import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,} from '@angular/router';
import { LazyLoading } from '../../directives/lazy-loading';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LazyLoading],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class FooterComponent {
  private router = inject(Router);
  
  onVisible(): void {
    console.log('ClubHub footer est visible');
  
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
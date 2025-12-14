import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  // Signal pour contrôler la sidebar sur mobile
  isSidebarOpen = signal(false);

  /**
   * Toggle sidebar sur mobile
   */
  toggleSidebar() {
    this.isSidebarOpen.update((state) => !state);
  }

  /**
   * Fermer la sidebar
   */
  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  /**
   * Fermer la sidebar quand on change de route
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Fermer automatiquement la sidebar si on revient sur desktop
    if (event.target.innerWidth > 768 && this.isSidebarOpen()) {
      this.closeSidebar();
    }
  }
}

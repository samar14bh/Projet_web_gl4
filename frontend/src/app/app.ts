import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ToastContainerComponent} from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}

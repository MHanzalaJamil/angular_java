import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top';

@Component({
  imports: [RouterOutlet, RouterLink, BackToTopComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}

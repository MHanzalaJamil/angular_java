import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {

  message = input('');
  type = input<'success' | 'error'>('success');

  closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}

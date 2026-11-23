import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {

  label = input.required<string>();

  variant = input<'green' | 'red' | 'link'>('green');

  clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}

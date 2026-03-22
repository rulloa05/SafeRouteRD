import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pill-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="'pill-button pill-button--' + variant"
      [class.pill-button--block]="block">
      <ng-content />
    </button>
  `,
  styleUrl: './pill-button.component.scss',
})
export class PillButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'danger' | 'success' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() block = false;
}

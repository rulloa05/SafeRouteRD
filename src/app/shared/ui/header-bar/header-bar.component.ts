import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header-bar">
      <button
        *ngIf="showBack"
        class="header-bar__back"
        (click)="goBack()"
        aria-label="Go back">
        <i class="bi bi-chevron-left"></i>
      </button>
      <i *ngIf="icon" [class]="'bi bi-' + icon + ' header-bar__icon'"></i>
      <span class="header-bar__title">{{ title }}</span>
      <ng-content />
    </header>
  `,
  styleUrl: './header-bar.component.scss',
})
export class HeaderBarComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() showBack = true;
  @Output() back = new EventEmitter<void>();

  constructor(private location: Location) {}

  goBack(): void {
    this.back.emit();
    this.location.back();
  }
}

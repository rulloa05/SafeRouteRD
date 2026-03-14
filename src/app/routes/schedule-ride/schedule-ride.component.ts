import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-schedule-ride',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBarComponent, PillButtonComponent, BottomNavComponent],
  template: `
    <div class="sched">
      <app-header-bar title="Programar Ruta"></app-header-bar>

      <div class="sched__body">
        <div class="sched__card">
          <div class="sched__field-label">Origen</div>
          <div class="sched__input-row">
            <span style="font-size:18px">📍</span>
            <input class="sched__input" [(ngModel)]="origin" placeholder="Tu ubicación actual"/>
          </div>

          <div class="sched__field-label" style="margin-top:12px">Destino</div>
          <div class="sched__input-row">
            <span style="font-size:18px">🏁</span>
            <input class="sched__input" [(ngModel)]="destination" placeholder="Ingresa el destino"/>
          </div>
        </div>

        <div class="sched__card">
          <div class="sched__field-label">Fecha y hora</div>
          <div class="sched__datetime-row">
            <input type="date" [(ngModel)]="date" class="sched__datetime-input" [min]="today"/>
            <input type="time" [(ngModel)]="time" class="sched__datetime-input"/>
          </div>
        </div>

        <div class="sched__card">
          <div class="sched__field-label">Recordatorio</div>
          <div class="sched__reminder-opts">
            <button *ngFor="let r of reminders" class="sched__reminder-btn"
              [class.sched__reminder-btn--sel]="reminder === r.value"
              (click)="reminder = r.value">{{ r.label }}</button>
          </div>
        </div>

        <div class="sched__card sched__card--green" *ngIf="destination">
          <div style="font-size:13px;font-weight:600;color:#065a5e;margin-bottom:4px">Vista previa</div>
          <div style="font-size:13px;color:#0d7377">{{ origin || 'Mi ubicación' }} → {{ destination }}</div>
          <div style="font-size:12px;color:#3a9fa3;margin-top:4px" *ngIf="date && time">📅 {{ date }} a las {{ time }}</div>
        </div>

        <app-pill-button variant="primary" [block]="true" [disabled]="!destination || !date || !time" (click)="onSchedule()">
          Programar ruta
        </app-pill-button>

        <div class="sched__success" *ngIf="scheduled">
          ✅ ¡Ruta programada! Recibirás un recordatorio {{ reminderLabel }} antes.
        </div>
      </div>

      <app-bottom-nav active="bookings"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .sched { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .sched__body { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
    .sched__card { background: $color-white; border-radius: $radius-md; padding: 16px; box-shadow: $shadow-card; &--green { background: rgba($color-primary,.05); border: 1px solid rgba($color-primary,.2); } }
    .sched__field-label { font-size: 11px; font-weight: $font-weight-bold; color: $color-gray-500; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
    .sched__input-row { display: flex; align-items: center; gap: 10px; background: $color-gray-50; border-radius: $radius-md; padding: 11px 13px; border: 1.5px solid $color-gray-200; }
    .sched__input { flex: 1; border: none; background: transparent; font-size: $font-size-sm; color: $color-gray-800; outline: none; &::placeholder { color: $color-gray-400; } }
    .sched__datetime-row { display: flex; gap: 10px; }
    .sched__datetime-input { flex: 1; padding: 11px 12px; border: 1.5px solid $color-gray-200; border-radius: $radius-md; font-size: $font-size-sm; color: $color-gray-800; outline: none; &:focus { border-color: $color-primary; } }
    .sched__reminder-opts { display: flex; gap: 8px; flex-wrap: wrap; }
    .sched__reminder-btn { padding: 8px 14px; border: 1.5px solid $color-gray-200; border-radius: $radius-pill; background: $color-gray-50; font-size: $font-size-sm; cursor: pointer; &--sel { border-color: $color-primary; background: rgba($color-primary,.08); color: $color-primary; font-weight: $font-weight-semibold; } }
    .sched__success { background: rgba($color-accent-green,.1); border: 1px solid rgba($color-accent-green,.3); border-radius: $radius-md; padding: 14px; font-size: $font-size-sm; color: #1e9e3a; text-align: center; }
  `],
})
export class ScheduleRideComponent {
  origin = '';
  destination = '';
  date = '';
  time = '';
  reminder = '15';
  scheduled = false;

  get today(): string { return new Date().toISOString().split('T')[0]; }
  get reminderLabel(): string { return this.reminders.find(r => r.value === this.reminder)?.label ?? '15 min'; }

  reminders = [
    { label: '5 min',  value: '5'  },
    { label: '15 min', value: '15' },
    { label: '30 min', value: '30' },
    { label: '1 hora', value: '60' },
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  onSchedule(): void {
    if (!this.destination || !this.date || !this.time) return;
    this.scheduled = true;
    this.cdr.detectChanges();
    setTimeout(() => this.router.navigate(['/routes/bookings']), 2000);
  }
}

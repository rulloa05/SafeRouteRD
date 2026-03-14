import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { RouteService } from '../../shared/services/route.service';
import { TripHistory, Booking } from '../../shared/models';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, HeaderBarComponent, BottomNavComponent],
  template: `
    <div class="bookings">
      <app-header-bar title="Historial de Rutas" [showBack]="false"></app-header-bar>

      <div class="bookings__tabs">
        <button class="bookings__tab" [class.bookings__tab--active]="tab === 'trips'" (click)="tab='trips'">Mis Viajes</button>
        <button class="bookings__tab" [class.bookings__tab--active]="tab === 'upcoming'" (click)="tab='upcoming'">Programadas</button>
      </div>

      <div class="bookings__list">

        <!-- TRIPS TAB (real history) -->
        <ng-container *ngIf="tab === 'trips'">
          <div *ngIf="trips.length === 0" class="bookings__empty">
            <div class="bookings__empty-icon">🗺️</div>
            <p>Aún no tienes viajes registrados.</p>
            <p class="bookings__empty-sub">Completa una ruta para verla aquí.</p>
          </div>

          <div *ngFor="let t of trips" class="bookings__card">
            <div class="bookings__card-top">
              <div class="bookings__route-icon">{{ vehicleIcon(t.vehicleType) }}</div>
              <div class="bookings__route-info">
                <div class="bookings__route-name">{{ t.routeName }}</div>
                <div class="bookings__route-detail">{{ t.origin }} → {{ t.destination }}</div>
              </div>
              <div class="bookings__badge bookings__badge--green">✅ Completado</div>
            </div>
            <div class="bookings__card-bottom">
              <span>📅 {{ t.date | date:'dd/MM/yyyy HH:mm' }}</span>
              <span>📏 {{ t.distanceKm.toFixed(1) }} km</span>
              <span>⏱ {{ t.durationMinutes }} min</span>
            </div>
            <div class="bookings__vehicle-row">
              {{ t.vehicleLabel }}
            </div>
          </div>

          <div *ngIf="trips.length > 0" class="bookings__clear">
            <button class="bookings__clear-btn" (click)="clearHistory()">🗑 Limpiar historial</button>
          </div>
        </ng-container>

        <!-- UPCOMING TAB (mock) -->
        <ng-container *ngIf="tab === 'upcoming'">
          <div *ngIf="loading" class="bookings__empty">
            <div class="bookings__spinner"></div>
          </div>
          <ng-container *ngIf="!loading">
            <div *ngFor="let b of bookings" class="bookings__card">
              <div class="bookings__card-top">
                <div class="bookings__route-icon">🚗</div>
                <div class="bookings__route-info">
                  <div class="bookings__route-name">{{ b.routeName }}</div>
                  <div class="bookings__route-detail">{{ b.date }} · {{ b.time }}</div>
                </div>
                <div class="bookings__badge" [class.bookings__badge--green]="b.status==='past'"
                  [class.bookings__badge--blue]="b.status==='current'">
                  {{ b.status === 'past' ? '✅ Completado' : '📅 Programado' }}
                </div>
              </div>
              <div class="bookings__card-bottom">
                <span>{{ b.vehicleName }}</span>
                <span>RD$ {{ b.cost }}</span>
                <span *ngIf="b.rating > 0">⭐ {{ b.rating }}</span>
              </div>
            </div>
          </ng-container>
        </ng-container>

      </div>

      <app-bottom-nav active="routes"></app-bottom-nav>
    </div>
  `,
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  tab: 'trips' | 'upcoming' = 'trips';
  trips: TripHistory[] = [];
  bookings: Booking[] = [];
  loading = false;

  constructor(private routeService: RouteService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTrips();
    this.loading = true;
    this.routeService.getBookings().subscribe(b => {
      this.bookings = b;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  loadTrips(): void {
    this.routeService.getHistory().subscribe(t => { this.trips = t; this.cdr.detectChanges(); });
  }

  vehicleIcon(type: string): string {
    const icons: Record<string, string> = { sedan: '🚗', suv: '🚙', moto: '🏍️', pickup: '🚚' };
    return icons[type] ?? '🚗';
  }

  clearHistory(): void {
    if (confirm('¿Limpiar todo el historial?')) {
      this.routeService.clearHistory();
      this.trips = [];
    }
  }
}

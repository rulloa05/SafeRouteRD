import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { RouteService } from '../../shared/services/route.service';

@Component({
  selector: 'app-routes-details',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBarComponent, PillButtonComponent, BottomNavComponent],
  template: `
    <div class="rdet2">
      <app-header-bar title="Detalle de reserva"></app-header-bar>

      <div class="rdet2__hero">
        <div class="rdet2__route-name">Casa → UNAPEC</div>
        <div class="rdet2__status-chip">✅ Completada</div>
        <div class="rdet2__date">20 de enero 2026 · 07:45 AM</div>
      </div>

      <div class="rdet2__body">
        <div class="rdet2__section">
          <div class="rdet2__section-title">Resumen del viaje</div>
          <div class="rdet2__row"><span>Vehículo</span><span>🚗 Sedán Toyota</span></div>
          <div class="rdet2__row"><span>Distancia</span><span>5.2 km</span></div>
          <div class="rdet2__row"><span>Duración</span><span>14 min</span></div>
          <div class="rdet2__row"><span>Costo gasolina</span><span>RD$ 65.00</span></div>
          <div class="rdet2__row"><span>Baches evitados</span><span class="rdet2__green">3 ✓</span></div>
          <div class="rdet2__row"><span>Condición vial</span><span class="rdet2__green">Buena</span></div>
        </div>

        <div class="rdet2__section">
          <div class="rdet2__section-title">Tu calificación</div>
          <div class="rdet2__stars">
            <span *ngFor="let s of [1,2,3,4,5]"
              class="rdet2__star" [class.rdet2__star--on]="s <= rating"
              (click)="rating = s">★</span>
          </div>
          <textarea [(ngModel)]="comment" placeholder="¿Cómo fue tu experiencia en esta ruta?" class="rdet2__comment" rows="3"></textarea>
          <app-pill-button *ngIf="!ratingDone" variant="primary" [block]="true" (click)="submitRating()">
            Enviar calificación
          </app-pill-button>
          <div class="rdet2__rating-done" *ngIf="ratingDone">¡Gracias por tu reseña! 🎉</div>
        </div>

        <app-pill-button variant="outline" [block]="true" (click)="repeatRoute()">
          🔁 Repetir esta ruta
        </app-pill-button>
      </div>

      <app-bottom-nav active="bookings"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .rdet2 { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .rdet2__hero { background: $gradient-primary; padding: 16px 20px 20px; }
    .rdet2__route-name { font-size: $font-size-xl; font-weight: $font-weight-bold; color: $color-white; margin-bottom: 6px; }
    .rdet2__status-chip { display: inline-block; background: rgba($color-white,.2); color: $color-white; font-size: 12px; font-weight: $font-weight-semibold; padding: 4px 12px; border-radius: 20px; margin-bottom: 6px; }
    .rdet2__date { font-size: $font-size-sm; color: rgba($color-white,.75); }
    .rdet2__body { padding: 14px 16px; display: flex; flex-direction: column; gap: 14px; }
    .rdet2__section { background: $color-white; border-radius: $radius-md; padding: 16px; box-shadow: $shadow-card; }
    .rdet2__section-title { font-size: 12px; font-weight: $font-weight-bold; color: $color-gray-500; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; }
    .rdet2__row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid $color-gray-100; font-size: $font-size-sm; color: $color-gray-700; &:last-child { border-bottom: none; } span:first-child { color: $color-gray-500; } }
    .rdet2__green { color: $color-primary; font-weight: $font-weight-semibold; }
    .rdet2__stars { display: flex; gap: 8px; margin-bottom: 12px; }
    .rdet2__star { font-size: 32px; color: $color-gray-300; cursor: pointer; transition: color .1s, transform .1s; &--on { color: $color-accent-gold; } &:hover { transform: scale(1.15); } }
    .rdet2__comment { width: 100%; padding: 11px 13px; border: 1.5px solid $color-gray-300; border-radius: $radius-md; font-family: inherit; font-size: $font-size-sm; resize: none; outline: none; margin-bottom: 12px; &:focus { border-color: $color-primary; } }
    .rdet2__rating-done { text-align: center; font-size: $font-size-sm; font-weight: $font-weight-semibold; color: $color-primary; padding: 10px; }
  `],
})
export class RoutesDetailsComponent {
  rating = 0;
  comment = '';
  ratingDone = false;

  constructor(private router: Router) {}

  submitRating(): void {
    if (this.rating === 0) return;
    this.ratingDone = true;
  }

  repeatRoute(): void { this.router.navigate(['/map/destination']); }
}

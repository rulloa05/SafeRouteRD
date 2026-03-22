import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderBarComponent } from '../shared/ui/header-bar/header-bar.component';
import { BottomNavComponent } from '../shared/ui/bottom-nav/bottom-nav.component';
import { RouteService } from '../shared/services/route.service';

const VEHICLES = [
  { id: 'sedan', label: 'Sedán', icon: '🚗', lp100: 8, fuel: 'Gasolina' },
  { id: 'suv', label: 'SUV / 4x4', icon: '🚙', lp100: 12, fuel: 'Diésel' },
  { id: 'moto', label: 'Motocicleta', icon: '🏍️', lp100: 3.5, fuel: 'Gasolina' },
  { id: 'pickup', label: 'Pick-up', icon: '🚚', lp100: 14, fuel: 'Diésel' },
];
const FUEL_PRICE_RD = 280; // RD$ per litre approx

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBarComponent, BottomNavComponent],
  template: `
    <div class="calc">
      <app-header-bar title="Calculadora de Gasolina" [showBack]="false"></app-header-bar>

      <div class="calc__body">
        <div class="calc__section">
          <div class="calc__label">Tipo de vehículo</div>
          <div class="calc__vgrid">
            <button class="calc__vbtn" *ngFor="let v of vehicles"
              [class.calc__vbtn--sel]="selectedVehicle === v.id"
              (click)="selectedVehicle = v.id; recalc()">
              <span class="calc__vbtn-icon">{{ v.icon }}</span>
              <span class="calc__vbtn-name">{{ v.label }}</span>
            </button>
          </div>
        </div>

        <div class="calc__section">
          <div class="calc__label">Distancia (km)</div>
          <div class="calc__slider-row">
            <input type="range" min="1" max="100" [(ngModel)]="distanceKm" (input)="recalc()" class="calc__slider"/>
            <span class="calc__slider-val">{{ distanceKm }} km</span>
          </div>
        </div>

        <div class="calc__section">
          <div class="calc__label">Precio combustible (RD$ / litro)</div>
          <div class="calc__slider-row">
            <input type="range" min="200" max="400" step="5" [(ngModel)]="fuelPrice" (input)="recalc()" class="calc__slider"/>
            <span class="calc__slider-val">RD$ {{ fuelPrice }}</span>
          </div>
        </div>

        <!-- Result card -->
        <div class="calc__result">
          <div class="calc__result-title">Estimado del viaje</div>
          <div class="calc__result-grid">
            <div class="calc__result-item">
              <div class="calc__result-val">{{ litresUsed.toFixed(2) }} L</div>
              <div class="calc__result-lbl">Combustible</div>
            </div>
            <div class="calc__result-item calc__result-item--gold">
              <div class="calc__result-val">RD$ {{ totalCost.toFixed(0) }}</div>
              <div class="calc__result-lbl">Costo total</div>
            </div>
            <div class="calc__result-item">
              <div class="calc__result-val">{{ co2.toFixed(1) }} kg</div>
              <div class="calc__result-lbl">CO₂ emitido</div>
            </div>
          </div>
          <div class="calc__fuel-type">
            Combustible: {{ currentVehicle?.fuel ?? 'Gasolina' }} ·
            Consumo: {{ currentVehicle?.lp100 ?? 8 }} L/100km
          </div>
        </div>

        <!-- Tip -->
        <div class="calc__tip">
          <span style="font-size:18px">💡</span>
          <span>Usa la ruta más corta segura para reducir combustible. SafeRoutes te muestra el costo estimado en cada ruta.</span>
        </div>
      </div>

      <app-bottom-nav active="profile"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .calc { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .calc__body { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .calc__section { background: $color-white; border-radius: $radius-md; padding: 16px; box-shadow: $shadow-card; }
    .calc__label { font-size: 12px; font-weight: $font-weight-bold; color: $color-gray-600; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; }
    .calc__vgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .calc__vbtn { display: flex; align-items: center; gap: 8px; padding: 11px 12px; border-radius: $radius-md; border: 2px solid $color-gray-200; background: $color-gray-50; cursor: pointer; transition: all .15s; &--sel { border-color: $color-primary; background: rgba($color-primary,.06); .calc__vbtn-name { color: $color-primary; } } }
    .calc__vbtn-icon { font-size: 20px; }
    .calc__vbtn-name { font-size: $font-size-sm; font-weight: $font-weight-semibold; color: $color-gray-700; }
    .calc__slider-row { display: flex; align-items: center; gap: 12px; }
    .calc__slider { flex: 1; accent-color: $color-primary; height: 4px; }
    .calc__slider-val { font-size: $font-size-sm; font-weight: $font-weight-bold; color: $color-primary; min-width: 70px; text-align: right; }
    .calc__result { background: $gradient-primary; border-radius: $radius-md; padding: 20px; }
    .calc__result-title { font-size: $font-size-sm; font-weight: $font-weight-bold; color: rgba($color-white,.8); margin-bottom: 14px; text-transform: uppercase; letter-spacing: .5px; }
    .calc__result-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
    .calc__result-item { background: rgba($color-white,.12); border-radius: $radius-md; padding: 12px 8px; text-align: center; &--gold { background: $color-accent-gold; } }
    .calc__result-val { font-size: 18px; font-weight: $font-weight-bold; color: $color-white; }
    .calc__result-lbl { font-size: 10px; color: rgba($color-white,.75); margin-top: 3px; }
    .calc__fuel-type { font-size: 11px; color: rgba($color-white,.7); }
    .calc__tip { background: rgba($color-primary,.08); border-radius: $radius-md; padding: 14px; display: flex; gap: 10px; align-items: flex-start; font-size: $font-size-sm; color: $color-gray-700; line-height: 1.5; border: 1px solid rgba($color-primary,.2); }
  `],
})
export class CalculatorComponent {
  vehicles = VEHICLES;
  selectedVehicle = 'sedan';
  distanceKm = 20;
  fuelPrice = FUEL_PRICE_RD;
  litresUsed = 0;
  totalCost = 0;
  co2 = 0;

  get currentVehicle() { return VEHICLES.find(v => v.id === this.selectedVehicle); }

  constructor(private routeService: RouteService) {
    this.selectedVehicle = this.routeService.currentVehicle;
    this.recalc();
  }

  recalc(): void {
    const v = this.currentVehicle;
    if (!v) return;
    this.litresUsed = (this.distanceKm * v.lp100) / 100;
    this.totalCost = this.litresUsed * this.fuelPrice;
    this.co2 = this.litresUsed * 2.31; // kg CO2 per litre petrol approx
  }
}

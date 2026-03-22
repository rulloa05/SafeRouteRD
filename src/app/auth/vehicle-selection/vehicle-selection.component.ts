import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { RouteService } from '../../shared/services/route.service';
import { LoggerService } from '../../shared/services/logger.service';
import { IconsService } from '../../shared/services/icons.service';

const VEHICLES = [
  { id: 'sedan',  label: 'Sedán',        desc: 'Altura baja · city',      badge: 'Evita baches' },
  { id: 'suv',    label: 'SUV / 4x4',    desc: 'Todo terreno · tracción', badge: 'Alta tracción' },
  { id: 'moto',   label: 'Motocicleta',  desc: 'Maniobrable · rápido',    badge: 'Rutas ágiles' },
  { id: 'pickup', label: 'Pick-up',      desc: 'Carga pesada · amplio',   badge: 'Alta carga' },
];

@Component({
  selector: 'app-vehicle-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vehicle">
      <div class="vehicle__top-bar">
        <div class="sbar dark" style="padding-top:50px"><span>9:41</span><span>100%</span></div>
        <div class="vehicle__step-lbl">Paso 1 de 2</div>
        <div class="vehicle__page-h">¿Qué vehículo usas?</div>
        <div class="vehicle__page-s">Calcularemos rutas compatibles con tu vehículo</div>
      </div>

      <div class="vehicle__scroll">
        <div class="vehicle__grid">
          <div class="vehicle__card" *ngFor="let v of vehicles"
            [class.vehicle__card--sel]="selected === v.id"
            (click)="selected = v.id">
            <div class="vehicle__icon" [innerHTML]="iconsService.vehicleSvg(v.id)"></div>
            <div class="vehicle__name">{{ v.label }}</div>
            <div class="vehicle__desc">{{ v.desc }}</div>
            <div class="vehicle__badge">{{ v.badge }}</div>
            <span class="vehicle__check" *ngIf="selected === v.id">✓</span>
          </div>
        </div>

        <div class="vehicle__conditions">
          <div class="vehicle__cond-title">Condiciones a evitar en tu ruta:</div>
          <label class="vehicle__cond-item" *ngFor="let c of conditions" [class.checked]="c.checked">
            <input type="checkbox" [(ngModel)]="c.checked"/>
            <span class="vehicle__cond-icon" [innerHTML]="iconsService.conditionSvg(c.svgKey)"></span>
            <span>{{ c.label }}</span>
          </label>
        </div>
      </div>

      <div class="vehicle__bot-bar">
        <button class="btn btn-primary" [disabled]="!selected" (click)="onContinue()">
          Continuar al mapa
        </button>
      </div>
    </div>
  `,
  styleUrl: './vehicle-selection.component.scss',
})
export class VehicleSelectionComponent {
  vehicles = VEHICLES;
  selected: string | null = null;
  conditions = [
    { svgKey: 'bache',     label: 'Baches y calles en mal estado', checked: true },
    { svgKey: 'pavimento', label: 'Calles no pavimentadas',        checked: true },
    { svgKey: 'inundacion',label: 'Inundaciones temporales',       checked: false },
    { svgKey: 'obra',      label: 'Obras en construcción',         checked: false },
  ];

  constructor(
    private auth: AuthService,
    private routeService: RouteService,
    private router: Router,
    private logger: LoggerService,
    public iconsService: IconsService,
  ) {
    this.selected = this.routeService.currentVehicle ?? 'sedan';
  }

  onContinue(): void {
    if (!this.selected) return;
    this.auth.updateUser({ vehicleType: this.selected as 'sedan' | 'suv' });
    this.routeService.setVehicle(this.selected);
    this.logger.info('VehicleSelection.selected', { vehicleType: this.selected });
    this.router.navigate(['/map']);
  }
}

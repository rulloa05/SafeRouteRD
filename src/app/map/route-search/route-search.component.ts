import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { RouteService } from '../../shared/services/route.service';
import { RouteOption } from '../../shared/models';

@Component({
  selector: 'app-route-search',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, BottomNavComponent],
  template: `
    <div class="route-search">
      <!-- Header -->
      <div class="route-search__head">
        <div class="sbar light"><span>9:41</span><span>100%</span></div>
        <button class="route-search__back" (click)="router.navigate(['/map/destination'])">← Volver</button>
        <div class="route-search__title">Rutas disponibles</div>
        <div class="route-search__sub" *ngIf="destName">📍 {{ destName }}</div>
        <div class="route-search__vehicle-chip">
          {{ vehicleIcon }} Rutas para {{ vehicleLabel }}
          <span *ngIf="realDist" class="route-search__vehicle-chip__osrm">
            {{ realDist }} km · {{ realMins }} min
          </span>
        </div>
      </div>

      <!-- Spinner -->
      <div class="route-search__body" *ngIf="loading"
           style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:14px">🗺️</div>
        <div style="font-size:15px;font-weight:700;color:rgba(13,185,150,.9)">Calculando rutas...</div>
        <div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:4px">Para tu {{ vehicleLabel }}</div>
      </div>

      <!-- Resultados -->
      <div class="route-search__body" *ngIf="!loading">
        <div class="route-search__section-title">{{ routes.length }} rutas encontradas</div>

        <div class="route-search__card"
          *ngFor="let r of routes"
          [class.route-search__card--best]="r.isRecommended"
          (click)="selectRoute(r)">

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span class="route-search__dot"
              [class.route-search__dot--g]="r.safetyLevel==='alto'"
              [class.route-search__dot--o]="r.safetyLevel==='medio'"
              [class.route-search__dot--r]="r.safetyLevel==='bajo'">
            </span>
            <span class="route-search__name">{{ r.name }}</span>
            <span class="route-search__badge"
              [class.route-search__badge--green]="r.isRecommended"
              [class.route-search__badge--gold]="!r.isRecommended && r.safetyLevel==='medio'"
              [class.route-search__badge--red]="r.safetyLevel==='bajo'">
              {{ r.isRecommended ? '✅ Recomendada' : r.safetyLevel==='bajo' ? '⚠️ Riesgo' : '↔ Alternativa' }}
            </span>
          </div>

          <div class="route-search__meta">
            ⏱ {{ r.estimatedMinutes }} min &nbsp;·&nbsp;
            📍 {{ r.distanceKm }} km &nbsp;·&nbsp;
            🛣 Vía {{ r.roadCondition }}
          </div>

          <div class="route-search__badges">
            <span class="route-search__badge route-search__badge--green" *ngIf="r.safetyLevel==='alto'">✅ Sin baches</span>
            <span class="route-search__badge route-search__badge--gold" *ngIf="r.roadCondition==='regular'">⚠️ Bache leve</span>
            <span class="route-search__badge route-search__badge--red"  *ngIf="r.roadCondition==='malo'">🕳️ Vía dañada</span>
            <span class="route-search__compat">{{ vehicleIcon }} Compatible</span>
          </div>
        </div>
      </div>

      <app-bottom-nav active="search"></app-bottom-nav>
    </div>
  `,
  styleUrl: './route-search.component.scss',
})
export class RouteSearchComponent implements OnInit {
  routes: RouteOption[] = [];
  loading = true;
  destName = '';
  realDist = '';
  realMins = '';
  destLat = '';
  destLng = '';
  vehicle = 'sedan';
  vehicleLabel = 'Sedán';
  vehicleIcon = '🚗';

  private readonly vehicleMap: Record<string, { label: string; icon: string }> = {
    sedan: { label: 'Sedán', icon: '🚗' }, suv: { label: 'SUV / 4x4', icon: '🚙' },
    moto:  { label: 'Motocicleta', icon: '🏍️' }, pickup: { label: 'Pick-up', icon: '🚚' },
  };

  constructor(
    private routeService: RouteService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.vehicle = this.routeService.currentVehicle;
    const v = this.vehicleMap[this.vehicle];
    if (v) { this.vehicleLabel = v.label; this.vehicleIcon = v.icon; }

    this.activatedRoute.queryParams.subscribe(params => {
      this.destName = params['dest'] ?? 'Destino seleccionado';
      if (params['dist']) this.realDist = params['dist'];
      if (params['mins']) this.realMins = params['mins'];
      if (params['lat'])  this.destLat  = params['lat'];
      if (params['lng'])  this.destLng  = params['lng'];
    });

    this.routeService.searchRoutes('origen', this.destName, this.vehicle).subscribe(routes => {
      // Si tenemos datos reales de OSRM, ajustar la ruta recomendada con esos valores
      if (this.realDist && this.realMins) {
        routes[0].distanceKm = +(this.realDist) || routes[0].distanceKm;
        routes[0].estimatedMinutes = +(this.realMins) || routes[0].estimatedMinutes;
      }
      this.routes = routes;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  selectRoute(r: RouteOption): void {
    this.router.navigate(['/map/detail'], {
      queryParams: {
        id: r.id, dest: this.destName,
        dist: r.distanceKm, mins: r.estimatedMinutes,
        dlat: this.destLat, dlng: this.destLng,
      },
    });
  }
}

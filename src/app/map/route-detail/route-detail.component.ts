import { Component, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { RouteService } from '../../shared/services/route.service';
import { RouteDetail } from '../../shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-route-detail',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <div class="rdetail">
      <!-- Hero header -->
      <div class="rdetail__hero">
        <div class="rdetail__sbar">
          <button class="rdetail__back" (click)="goBack()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <span class="rdetail__hero-title">Detalle de ruta</span>
        </div>
        <div class="rdetail__hero-body" *ngIf="detail">
          <div class="rdetail__name">{{ detail.name }}</div>
          <div class="rdetail__route-path">
            <span>{{ detail.startPoint }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ detail.dropLocation }}</span>
          </div>
        </div>
      </div>

      <div class="rdetail__scroll" *ngIf="detail">
        <!-- Stats row -->
        <div class="rdetail__stats">
          <div class="rdetail__stat">
            <div class="rdetail__stat-val">{{ detail.estimatedMinutes }}<span class="rdetail__stat-unit">min</span></div>
            <div class="rdetail__stat-lbl">Tiempo</div>
          </div>
          <div class="rdetail__stat-divider"></div>
          <div class="rdetail__stat">
            <div class="rdetail__stat-val">{{ detail.distanceKm }}<span class="rdetail__stat-unit">km</span></div>
            <div class="rdetail__stat-lbl">Distancia</div>
          </div>
          <div class="rdetail__stat-divider"></div>
          <div class="rdetail__stat">
            <div class="rdetail__stat-val rdetail__stat-val--gold">{{ gasAmount }}<span class="rdetail__stat-unit">RD$</span></div>
            <div class="rdetail__stat-lbl">Gasolina est.</div>
          </div>
        </div>

        <!-- Map -->
        <div class="rdetail__map">
          <div id="route-detail-map" class="rdetail__leaflet"></div>
        </div>

        <!-- Road conditions -->
        <div class="rdetail__section">
          <div class="rdetail__section-title">Estado de la ruta</div>
          <div class="rdetail__cond-item">
            <div class="rdetail__cond-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" width="20" height="20"><rect x="1" y="3" width="22" height="18" rx="2"/><path d="M1 9h22M1 15h22"/></svg></div>
            <div class="rdetail__cond-info">
              <div class="rdetail__cond-name">Superficie vial</div>
              <div class="rdetail__cond-desc">98% pavimento en buen estado</div>
            </div>
            <span class="rdetail__tag rdetail__tag--ok">Óptimo</span>
          </div>
          <div class="rdetail__cond-item">
            <div class="rdetail__cond-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            <div class="rdetail__cond-info">
              <div class="rdetail__cond-name">Baches detectados</div>
              <div class="rdetail__cond-desc">0 en esta ruta</div>
            </div>
            <span class="rdetail__tag rdetail__tag--ok">Libre</span>
          </div>
          <div class="rdetail__cond-item">
            <div class="rdetail__cond-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1" fill="#ef4444" stroke="none"/><circle cx="12" cy="12" r="1" fill="#f59e0b" stroke="none"/><circle cx="12" cy="16" r="1" fill="#22c55e" stroke="none"/></svg></div>
            <div class="rdetail__cond-info">
              <div class="rdetail__cond-name">Tráfico</div>
              <div class="rdetail__cond-desc">Flujo moderado en hora pico</div>
            </div>
            <span class="rdetail__tag rdetail__tag--warn">Moderado</span>
          </div>
          <div class="rdetail__cond-item">
            <div class="rdetail__cond-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" width="20" height="20"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg></div>
            <div class="rdetail__cond-info">
              <div class="rdetail__cond-name">Compatibilidad vehículo</div>
              <div class="rdetail__cond-desc">Apta para {{ vehicleLabel }}</div>
            </div>
            <span class="rdetail__tag rdetail__tag--ok">Compatible</span>
          </div>
        </div>

        <!-- Alternatives -->
        <div class="rdetail__section">
          <div class="rdetail__section-title">Rutas alternativas</div>
          <div class="rdetail__alt" *ngFor="let alt of detail.alternatives" (click)="goToSearch()">
            <span>{{ alt.name }}</span>
            <span class="rdetail__alt-time">{{ alt.estimatedMinutes }} min →</span>
          </div>
        </div>

        <!-- Emergency -->
        <div class="rdetail__emergency">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Emergencia: <strong>{{ detail.emergencyNumber }}</strong></span>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="rdetail__bottom">
        <button class="btn btn-primary" style="flex:1" (click)="startNav()">
          ▶ Iniciar navegación
        </button>
      </div>
    </div>
  `,
  styleUrl: './route-detail.component.scss',
})
export class RouteDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  detail?: RouteDetail;
  gasAmount = 0;
  vehicleLabel = 'Sedán';
  private destLat = '';
  private destLng = '';
  private destName = '';
  private map!: L.Map;

  constructor(
    private routeService: RouteService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const v = this.routeService.currentVehicle;
    const labels: Record<string, string> = { sedan: 'Sedán', suv: 'SUV / 4x4', moto: 'Motocicleta', pickup: 'Pick-up' };
    this.vehicleLabel = labels[v] ?? 'Sedán';

    this.destLat  = this.route.snapshot.queryParamMap.get('dlat') ?? '';
    this.destLng  = this.route.snapshot.queryParamMap.get('dlng') ?? '';
    this.destName = this.route.snapshot.queryParamMap.get('dest') ?? 'Destino';
    const id = this.route.snapshot.queryParamMap.get('id') ?? 'r1';
    this.routeService.getRouteDetail(id).subscribe(d => {
      this.detail = d;
      this.routeService.calculateGas(d.distanceKm, d.estimatedMinutes, v).subscribe(g => {
        this.gasAmount = g.totalAmount;
        this.cdr.detectChanges();
      });
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 300); }
  ngOnDestroy(): void { if (this.map) this.map.remove(); }

  private initMap(): void {
    const el = document.getElementById('route-detail-map');
    if (!el) return;
    this.map = L.map(el, { center: [18.478, -69.915], zoom: 13, zoomControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM', maxZoom: 19,
    }).addTo(this.map);
    const routeCoords: L.LatLngExpression[] = [
      [18.4701, -69.9312], [18.475, -69.92], [18.48, -69.91], [18.483, -69.901], [18.4861, -69.8982],
    ];
    L.polyline(routeCoords, { color: '#0d7377', weight: 5, opacity: .9 }).addTo(this.map);
    const greenIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', iconSize: [25, 41], iconAnchor: [12, 41], shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });
    const redIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41], shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });
    L.marker([18.4701, -69.9312], { icon: greenIcon }).addTo(this.map).bindPopup('📍 Origen');
    L.marker([18.4861, -69.8982], { icon: redIcon }).addTo(this.map).bindPopup('🏁 Destino');
    setTimeout(() => this.map.invalidateSize(), 200);
  }

  goBack(): void { this.router.navigate(['/map/search']); }
  goToSearch(): void { this.router.navigate(['/map/search']); }
  startNav(): void {
    this.router.navigate(['/map/active'], {
      queryParams: {
        dest:  this.destName,
        route: this.detail?.name ?? 'Ruta',
        dist:  this.detail?.distanceKm ?? 5.2,
        mins:  this.detail?.estimatedMinutes ?? 14,
        dlat:  this.destLat,
        dlng:  this.destLng,
      },
    });
  }
}

import { Component, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteService } from '../../shared/services/route.service';
import { GpsService } from '../../shared/services/gps.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-active-route',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <div class="active">
      <div id="active-map" class="active__map"></div>

      <!-- Top instruction panel -->
      <div class="active__top">
        <div class="active__instruction">
          <div class="active__turn-icon">↗</div>
          <div class="active__turn-info">
            <div class="active__turn-dist">En 200 m</div>
            <div class="active__turn-street">Gira a la derecha en Av. Máximo Gómez</div>
          </div>
          <button class="active__close" (click)="onStop()">✕</button>
        </div>
      </div>

      <!-- Alert bar -->
      <div class="active__alert" *ngIf="showAlert">
        ⚠️ Bache reportado a 500 m — preparándose para desvío
      </div>

      <!-- Bottom panel -->
      <div class="active__bottom">
        <div class="active__eta">
          <div class="active__eta-block">
            <span class="active__eta-val">{{ elapsed }}:{{ seconds | number:'2.0' }}</span>
            <span class="active__eta-lbl">transcurrido</span>
          </div>
          <div class="active__eta-sep"></div>
          <div class="active__eta-block">
            <span class="active__eta-val">{{ remainingKm.toFixed(1) }}</span>
            <span class="active__eta-lbl">km restantes</span>
          </div>
          <div class="active__eta-sep"></div>
          <div class="active__eta-block active__eta-block--green">
            <span class="active__eta-val">{{ arrivalTime }}</span>
            <span class="active__eta-lbl">llegada est.</span>
          </div>
        </div>
        <button class="active__stop" (click)="onStop()">Finalizar navegación</button>
      </div>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .active { position: relative; height: 100dvh; width: 100%; overflow: hidden; }
    .active__map { position: absolute; inset: 0; z-index: 1; }
    .active__top {
      position: absolute; top: 0; left: 0; right: 0; z-index: 1000;
      padding: 12px 14px 0;
    }
    .active__instruction {
      background: $color-primary; border-radius: $radius-md;
      padding: 14px; display: flex; align-items: center; gap: 12px;
      box-shadow: $shadow-elevated;
    }
    .active__turn-icon {
      width: 44px; height: 44px; background: rgba($color-white, .2); border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: $color-white; flex-shrink: 0;
    }
    .active__turn-info { flex: 1; }
    .active__turn-dist { font-size: 12px; color: rgba($color-white, .8); }
    .active__turn-street { font-size: 14px; font-weight: $font-weight-bold; color: $color-white; }
    .active__close {
      background: rgba($color-white, .2); border: none; color: $color-white;
      border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .active__alert {
      position: absolute; top: 90px; left: 14px; right: 14px; z-index: 1000;
      background: #e67e22; color: $color-white; font-size: 13px; font-weight: $font-weight-semibold;
      padding: 10px 14px; border-radius: $radius-md; box-shadow: $shadow-card;
      animation: slideDown .3s ease;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .active__bottom {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
      background: $color-white; border-radius: 24px 24px 0 0;
      padding: 16px 16px 24px; box-shadow: 0 -4px 24px rgba(0,0,0,.1);
    }
    .active__eta {
      display: flex; align-items: center; margin-bottom: 14px;
    }
    .active__eta-block { flex: 1; text-align: center; }
    .active__eta-block--green .active__eta-val { color: $color-primary; }
    .active__eta-val { display: block; font-size: 22px; font-weight: $font-weight-bold; color: $color-gray-800; }
    .active__eta-lbl { font-size: 11px; color: $color-gray-500; }
    .active__eta-sep { width: 1px; height: 36px; background: $color-gray-200; }
    .active__stop {
      width: 100%; padding: 14px; background: $color-accent-red; color: $color-white;
      border: none; border-radius: $radius-pill; font-size: $font-size-base;
      font-weight: $font-weight-bold; cursor: pointer;
    }
  `],
})
export class ActiveRouteComponent implements OnInit, AfterViewInit, OnDestroy {
  elapsed = '00';
  seconds = 0;
  remainingKm = 5.2;
  arrivalTime = '';
  showAlert = false;
  private map!: L.Map;
  private timer?: ReturnType<typeof setInterval>;
  private secs = 0;

  private origin = 'Tu ubicación';
  private destination = 'Destino';
  private routeName = 'Ruta Óptima';
  private distanceKm = 5.2;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private routeService: RouteService,
    private gpsService: GpsService,
    private cdr: ChangeDetectorRef,
  ) {
    this.route.queryParams.subscribe(p => {
      if (p['origin']) this.origin = p['origin'];
      if (p['dest']) this.destination = p['dest'];
      if (p['route']) this.routeName = p['route'];
      if (p['dist']) this.distanceKm = parseFloat(p['dist']) || 5.2;
    });
  }

  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 14);
    this.arrivalTime = now.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

    this.timer = setInterval(() => {
      this.secs++;
      this.elapsed = String(Math.floor(this.secs / 60)).padStart(2, '0');
      this.seconds = this.secs % 60;
      this.remainingKm = Math.max(0, 5.2 - (this.secs * 5.2 / 840));
      if (this.secs === 10) this.showAlert = true;
      if (this.secs === 16) this.showAlert = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 200); }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.timer) clearInterval(this.timer);
  }

  private initMap(): void {
    const el = document.getElementById('active-map');
    if (!el) return;
    this.map = L.map(el, { center: [18.478, -69.915], zoom: 15, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM', maxZoom: 19,
    }).addTo(this.map);
    const route: L.LatLngExpression[] = [
      [18.4701, -69.9312], [18.475, -69.92], [18.48, -69.91], [18.483, -69.901], [18.4861, -69.8982],
    ];
    L.polyline(route, { color: '#0d7377', weight: 6, opacity: .95 }).addTo(this.map);
    L.circle([18.475, -69.92], { radius: 80, color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: .3 })
      .addTo(this.map).bindPopup('⚠️ Bache reportado');
    L.circleMarker([18.4701, -69.9312], { radius: 10, color: '#0d7377', fillColor: '#0d7377', fillOpacity: 1 })
      .addTo(this.map).bindPopup('📍 Aquí');
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  onStop(): void {
    const vehicle = this.routeService.currentVehicle;
    const vehicleLabels: Record<string, string> = {
      sedan: 'Sedán', suv: 'SUV', moto: 'Motocicleta', pickup: 'Pick-up',
    };
    this.routeService.addTrip({
      origin: this.origin,
      destination: this.destination,
      vehicleType: vehicle,
      vehicleLabel: vehicleLabels[vehicle] ?? vehicle,
      distanceKm: this.distanceKm,
      durationMinutes: Math.floor(this.secs / 60),
      routeName: this.routeName,
    });
    this.router.navigate(['/map']);
  }
}

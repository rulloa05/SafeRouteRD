import { Component, AfterViewInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { LoggerService } from '../../shared/services/logger.service';
import { RouteService } from '../../shared/services/route.service';
import { GpsService } from '../../shared/services/gps.service';
import { IconsService } from '../../shared/services/icons.service';
import { UserIncident } from '../../shared/models';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

// Default incidents always shown
const BASE_INCIDENTS = [
  { lat: 18.4740, lng: -69.9160, icon: '🕳️', label: 'Bache severo' },
  { lat: 18.4820, lng: -69.9100, icon: '🏗️', label: 'Obra activa' },
  { lat: 18.4680, lng: -69.9250, icon: '🌊', label: 'Zona inundable' },
  { lat: 18.4760, lng: -69.9400, icon: '🚦', label: 'Tráfico alto' },
];

@Component({
  selector: 'app-map-home',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, BottomNavComponent],
  template: `
    <div class="map-home">
      <div id="leaflet-map" class="map-home__map"></div>

      <!-- Top search bar -->
      <div class="map-home__topbar">
        <div class="map-home__search-box" (click)="goToDestination()">
          <span class="map-home__search-icon">🔍</span>
          <span class="map-home__search-text">¿A dónde vas hoy?</span>
          <div class="map-home__v-chip" (click)="$event.stopPropagation(); goVehicle()">
            {{ vehicleIcon }} {{ vehicleLabel }}
          </div>
        </div>
      </div>

      <!-- FABs -->
      <button class="map-home__fab map-home__fab--notif" (click)="toggleNotif()">
        🔔
        <span class="map-home__notif-dot" *ngIf="notifCount > 0">{{ notifCount }}</span>
      </button>
      <button class="map-home__fab map-home__fab--report" [class.open]="showReport"
        (click)="showReport = !showReport">+</button>
      <button class="map-home__fab map-home__fab--locate" (click)="locateMe()">📍</button>

      <!-- Report menu -->
      <div class="map-home__report-menu" *ngIf="showReport">
        <div class="map-home__report-title">Reportar incidente</div>
        <button class="map-home__report-item" *ngFor="let r of reportTypes" (click)="onReport(r)">
          <span class="map-home__report-svg" [innerHTML]="iconsService.incidentSvg(r.svgKey)"></span>
          <span>{{ r.label }}</span>
        </button>
      </div>

      <!-- Notification panel -->
      <div class="map-home__notif-panel" *ngIf="showNotif">
        <div class="map-home__notif-header">
          <span>Alertas activas</span>
          <button (click)="showNotif=false">✕</button>
        </div>
        <div class="map-home__notif-item" *ngFor="let n of notifications">
          <span>{{ n.icon }}</span>
          <div><div class="map-home__notif-label">{{ n.label }}</div>
          <div class="map-home__notif-time">{{ n.time }}</div></div>
        </div>
      </div>

      <!-- Toast -->
      <div class="map-home__toast" *ngIf="toastMsg">{{ toastMsg }}</div>

      <!-- Bottom panel -->
      <div class="map-home__panel">
        <div class="map-home__drag-bar"></div>
        <div class="map-home__panel-title">Rutas recomendadas para ti</div>

        <!-- Stats -->
        <div class="map-home__stats">
          <div class="map-home__stat">
            <div class="map-home__stat-val map-home__stat-val--good">98%</div>
            <div class="map-home__stat-lbl">Vías buenas</div>
          </div>
          <div class="map-home__stat">
            <div class="map-home__stat-val">3</div>
            <div class="map-home__stat-lbl">Incidentes</div>
          </div>
          <div class="map-home__stat">
            <div class="map-home__stat-val map-home__stat-val--good">12°C</div>
            <div class="map-home__stat-lbl">Temperatura</div>
          </div>
        </div>

        <!-- Alert bar -->
        <div class="map-home__alert-bar">
          ⚠️ <span>Bache reportado en Av. Mella — desvío sugerido activo</span>
        </div>

        <!-- Route options -->
        <div class="map-home__routes">
          <div class="map-home__route-opt map-home__route-opt--best" (click)="goToSearch('Ruta Óptima')">
            <span class="map-home__rdot map-home__rdot--g"></span>
            <div class="map-home__rinfo">
              <div class="map-home__rname">Ruta Óptima</div>
              <div class="map-home__rdet">14 min · 5.2 km · Sin baches</div>
            </div>
            <span class="map-home__rbadge map-home__rbadge--g">✅ Recomendada</span>
          </div>
          <div class="map-home__route-opt" (click)="goToSearch('Ruta Alternativa')">
            <span class="map-home__rdot map-home__rdot--o"></span>
            <div class="map-home__rinfo">
              <div class="map-home__rname">Ruta Alternativa</div>
              <div class="map-home__rdet">18 min · 6.8 km · 1 bache leve</div>
            </div>
            <span class="map-home__rbadge map-home__rbadge--o">↔ Alternativa</span>
          </div>
          <div class="map-home__route-opt" (click)="goToSearch('Ruta Más Corta')">
            <span class="map-home__rdot map-home__rdot--r"></span>
            <div class="map-home__rinfo">
              <div class="map-home__rname">Ruta Más Corta</div>
              <div class="map-home__rdet">11 min · 4.1 km · Vía dañada</div>
            </div>
            <span class="map-home__rbadge map-home__rbadge--r">⚠️ Riesgo</span>
          </div>
        </div>
      </div>

      <app-bottom-nav active="map"></app-bottom-nav>
    </div>
  `,
  styleUrl: './map-home.component.scss',
})
export class MapHomeComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private userMarker?: L.Layer;
  private userAccCircle?: L.Circle;
  private incidentMarkers: L.Marker[] = [];
  private gpsSub: any;

  vehicleIcon  = '🚗';
  vehicleLabel = 'Sedán';
  showReport   = false;
  showNotif    = false;
  notifCount   = 3;
  toastMsg     = '';
  gpsActive    = false;

  reportTypes = [
    { icon: '🕳️', label: 'Bache / mal estado',    svgKey: 'bache' },
    { icon: '🌊', label: 'Inundación',              svgKey: 'inundacion' },
    { icon: '🏗️', label: 'Obra / cierre de calle', svgKey: 'obra' },
    { icon: '🚗', label: 'Accidente de tránsito',  svgKey: 'accidente' },
    { icon: '🚦', label: 'Semáforo dañado',        svgKey: 'semaforo' },
  ];

  notifications = [
    { icon: '🕳️', label: 'Bache reportado en Av. Mella — km 2', time: 'hace 5 min' },
    { icon: '🌊', label: 'Zona inundable activa en Los Alcarrizos', time: 'hace 18 min' },
    { icon: '✅', label: 'Av. Máximo Gómez despejada', time: 'hace 32 min' },
  ];

  private readonly vehicleMap: Record<string, { label: string; icon: string }> = {
    sedan:  { label: 'Sedán',   icon: '🚗' },
    suv:    { label: 'SUV',     icon: '🚙' },
    moto:   { label: 'Moto',    icon: '🏍️' },
    pickup: { label: 'Pick-up', icon: '🚚' },
  };

  constructor(
    public router: Router,
    private logger: LoggerService,
    private routeService: RouteService,
    private gpsService: GpsService,
    public iconsService: IconsService,
    private cdr: ChangeDetectorRef,
  ) {
    const v = this.routeService.currentVehicle;
    const vm = this.vehicleMap[v];
    if (vm) { this.vehicleIcon = vm.icon; this.vehicleLabel = vm.label; }
  }

  ngAfterViewInit(): void { this.initMap(); }
  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.gpsSub) this.gpsSub.unsubscribe();
    this.gpsService.stopWatch();
  }

  private initMap(): void {
    const el = document.getElementById('leaflet-map');
    if (!el) return;
    const initPos = this.gpsService.currentPosition;
    this.map = L.map(el, { center: [initPos.lat, initPos.lng], zoom: 13, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 19,
    }).addTo(this.map);

    L.polyline([[18.4861,-69.9312],[18.484,-69.924],[18.480,-69.916],[18.476,-69.910]],
      { color: '#0d7377', weight: 5, opacity: .85 }).addTo(this.map).bindPopup('✅ Ruta sugerida');

    this.renderAllIncidents();
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 0);
    setTimeout(() => this.map.invalidateSize(), 300);

    // GPS watch — update marker continuously
    this.gpsService.startWatch();
    this.gpsSub = this.gpsService.position.subscribe(pos => {
      if (pos.accuracy === 0) return;
      this.gpsActive = true;
      this.updateUserMarker(pos.lat, pos.lng, pos.accuracy);
    });

    // Center map on first fix
    this.gpsService.requestOnce().then(pos => {
      if (pos.accuracy > 0) {
        this.map.setView([pos.lat, pos.lng], 14);
        this.updateUserMarker(pos.lat, pos.lng, pos.accuracy);
        this.gpsActive = true;
      }
    });
  }

  private updateUserMarker(lat: number, lng: number, accuracy: number): void {
    if (!this.map) return;
    const vehicle = this.routeService.currentVehicle;
    if (this.userMarker) {
      (this.userMarker as L.Marker).setLatLng([lat, lng]);
      this.userAccCircle?.setLatLng([lat, lng]).setRadius(accuracy);
    } else {
      this.userAccCircle = L.circle([lat, lng], {
        radius: accuracy, color: '#0d7377', fillColor: '#0d7377', fillOpacity: 0.08, weight: 1,
      }).addTo(this.map);
      const gpsIcon = L.divIcon({
        html: this.iconsService.gpsMarkerHtml(),
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
      });
      this.userMarker = L.marker([lat, lng], { icon: gpsIcon })
        .addTo(this.map).bindPopup('📍 Tú estás aquí');
    }
  }

  private renderAllIncidents(): void {
    this.incidentMarkers.forEach(m => m.remove());
    this.incidentMarkers = [];
    const allIncidents = [
      ...BASE_INCIDENTS,
      ...this.routeService.getUserIncidents().map(i => ({ lat: i.lat, lng: i.lng, icon: i.icon, label: i.label })),
    ];
    allIncidents.forEach(inc => {
      const marker = L.marker([inc.lat, inc.lng], {
        icon: L.divIcon({
          html: this.iconsService.incidentMarkerHtml(inc.icon),
          className: '', iconSize: [32, 32], iconAnchor: [16, 32],
        }),
      }).addTo(this.map).bindPopup(`<strong>${inc.label}</strong>`);
      this.incidentMarkers.push(marker);
    });
  }

  goToDestination(): void { this.router.navigate(['/map/destination']); }
  goVehicle(): void { this.router.navigate(['/auth/vehicle-selection']); }
  goToSearch(dest: string): void { this.router.navigate(['/map/search'], { queryParams: { dest } }); }
  toggleNotif(): void { this.showNotif = !this.showNotif; if (this.showNotif) this.notifCount = 0; }

  locateMe(): void {
    if (!this.map) return;
    this.gpsService.requestOnce().then(pos => {
      if (pos.accuracy > 0) {
        this.map.setView([pos.lat, pos.lng], 16);
        this.updateUserMarker(pos.lat, pos.lng, pos.accuracy);
        this.toastMsg = '📍 Ubicación actualizada';
        this.cdr.detectChanges();
        setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 2000);
      } else {
        this.toastMsg = '⚠️ No se pudo obtener GPS';
        this.cdr.detectChanges();
        setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 2500);
      }
    });
  }

  onReport(r: { icon: string; label: string }): void {
    this.showReport = false;
    const pos = this.gpsService.currentPosition;
    this.routeService.addIncident({
      icon: r.icon, label: r.label,
      lat: pos.lat + (Math.random() - 0.5) * 0.002,
      lng: pos.lng + (Math.random() - 0.5) * 0.002,
    });
    this.renderAllIncidents();
    this.notifCount++;
    this.notifications.unshift({ icon: r.icon, label: `${r.label} reportado cerca de tu ubicación`, time: 'ahora' });
    this.toastMsg = `${r.icon} "${r.label}" reportado. ¡Gracias!`;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 3000);
  }
}

import { Component, AfterViewInit, OnDestroy, ViewEncapsulation, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

const RECENTS = [
  { icon: '🏛️', name: 'UNAPEC',                    address: 'Av. Máximo Gómez, Santo Domingo',  lat: 18.4701, lng: -69.9312 },
  { icon: '✈️', name: 'Aeropuerto Las Américas',   address: 'Santo Domingo Este',                lat: 18.4296, lng: -69.6689 },
  { icon: '🛒', name: 'Ágora Mall',                address: 'Av. John F. Kennedy',               lat: 18.4883, lng: -69.9602 },
  { icon: '🏥', name: 'Hospital Plaza de la Salud', address: 'Av. Ortega y Gasset',               lat: 18.4657, lng: -69.9444 },
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: { road?: string; city?: string; country?: string; };
}

@Component({
  selector: 'app-set-destination',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div class="set-dest">
      <!-- Header -->
      <div class="set-dest__head">
        <div class="sbar light"><span>9:41</span><span>100%</span></div>
        <button class="set-dest__back" (click)="router.navigate(['/map'])">← Volver</button>
        <div class="set-dest__head-title">Establecer destino</div>
      </div>

      <!-- Inputs origen / destino -->
      <div class="set-dest__form">
        <div class="set-dest__input-row">
          <span class="set-dest__dot set-dest__dot--origin"></span>
          <input class="set-dest__input" [value]="origin" readonly placeholder="Mi ubicación actual"/>
          <button class="set-dest__locate-btn" (click)="locateMe()" title="Mi ubicación">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div style="padding:0 18px"><div style="height:1px;background:rgba(255,255,255,.1)"></div></div>
        <div class="set-dest__input-row" [class.set-dest__input-row--active]="showSuggestions">
          <span class="set-dest__dot set-dest__dot--dest"></span>
          <input class="set-dest__input" [(ngModel)]="destination"
            placeholder="¿A dónde vas?"
            (input)="onType()"
            (focus)="onFocus()"
            (blur)="onBlur()"/>
          <button *ngIf="destination" class="set-dest__locate-btn" style="color:rgba(231,76,60,.85)"
            (click)="clearDest()">✕</button>
          <!-- Spinner de búsqueda -->
          <div *ngIf="searching" style="width:18px;height:18px;border:2px solid #0d7377;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0"></div>
        </div>
      </div>

      <!-- AUTOCOMPLETE Nominatim -->
      <div class="set-dest__autocomplete" *ngIf="showSuggestions && (suggestions.length > 0 || destination.length > 1)">
        <div *ngIf="searching && suggestions.length === 0" class="set-dest__ac-loading">
          🔍 Buscando...
        </div>
        <div class="set-dest__ac-item" *ngFor="let s of suggestions" (mousedown)="selectSuggestion(s)">
          <div class="set-dest__ac-icon">📍</div>
          <div style="flex:1;min-width:0">
            <div class="set-dest__ac-name">{{ s.shortName }}</div>
            <div class="set-dest__ac-addr">{{ s.fullAddress }}</div>
          </div>
        </div>
        <!-- Atribución requerida por Nominatim OSM -->
        <div style="padding:6px 12px;font-size:10px;color:rgba(255,255,255,.28);text-align:right">
          © OpenStreetMap Nominatim
        </div>
      </div>

      <!-- Recientes (cuando no hay búsqueda activa) -->
      <div class="set-dest__recents" *ngIf="!showSuggestions || destination.length === 0">
        <div class="set-dest__recents-title">Destinos recientes</div>
        <div class="set-dest__recent-item" *ngFor="let r of RECENTS" (click)="selectRecent(r)">
          <div class="set-dest__recent-icon-wrap">{{ r.icon }}</div>
          <div style="flex:1">
            <div class="set-dest__recent-name">{{ r.name }}</div>
            <div class="set-dest__recent-addr">{{ r.address }}</div>
          </div>
          <span class="set-dest__recent-arrow">›</span>
        </div>
      </div>

      <!-- Mapa -->
      <div class="set-dest__map">
        <div id="dest-leaflet-map" class="set-dest__map-el"></div>
        <!-- Hint flotante -->
        <div class="set-dest__map-hint" *ngIf="!destLat && !loadingRoute">
          📍 Toca el mapa para fijar destino
        </div>
        <!-- Overlay calculando ruta -->
        <div class="set-dest__route-overlay" *ngIf="loadingRoute">
          <div style="font-size:28px;margin-bottom:8px">🗺️</div>
          <div style="font-size:14px;font-weight:700;color:rgba(13,185,150,.9)">Calculando ruta real...</div>
          <div style="font-size:12px;color:rgba(255,255,255,.45);margin-top:3px">Via OSRM OpenStreetMap</div>
        </div>
        <!-- Badge con info de ruta -->
        <div class="set-dest__route-badge" *ngIf="routeInfo && !loadingRoute">
          <span class="set-dest__badge-dot"></span>
          <strong>{{ routeInfo.dist }} km</strong>&nbsp;·&nbsp;{{ routeInfo.mins }} min estimado
        </div>
      </div>

      <!-- Botón ir -->
      <div class="set-dest__bot">
        <button class="set-dest__go-btn" [disabled]="!destination || loadingRoute" (click)="onNext()">
          <span *ngIf="!loadingRoute">Ver rutas disponibles →</span>
          <span *ngIf="loadingRoute" style="display:flex;align-items:center;gap:8px;justify-content:center">
            <span style="width:16px;height:16px;border:2px solid rgba(255,255,255,.5);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0"></span>
            Calculando ruta...
          </span>
        </button>
      </div>

      <app-bottom-nav active="search"></app-bottom-nav>
    </div>

    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `,
  styleUrl: './set-destination.component.scss',
})
export class SetDestinationComponent implements AfterViewInit, OnDestroy {
  RECENTS = RECENTS;
  origin       = 'Mi ubicación actual';
  destination  = '';
  showSuggestions = false;
  searching    = false;
  loadingRoute = false;
  destLat: number | null = null;
  destLng: number | null = null;
  originLat = 18.4861; originLng = -69.9312;
  suggestions: { shortName: string; fullAddress: string; lat: number; lng: number }[] = [];
  routeInfo: { dist: string; mins: number } | null = null;

  private map!: L.Map;
  private destMarker?: L.Layer;
  private originMarker?: L.Layer;
  private routeLine?: L.Polyline;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(public router: Router, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 100); }
  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  private initMap(): void {
    const el = document.getElementById('dest-leaflet-map');
    if (!el) return;
    this.map = L.map(el, { center: [18.4861, -69.9312], zoom: 12, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM', maxZoom: 19,
    }).addTo(this.map);
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.destLat = e.latlng.lat; this.destLng = e.latlng.lng;
      this.destination = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
      this.showSuggestions = false; this.suggestions = [];
      this.placeDestMarker(e.latlng.lat, e.latlng.lng, 'Destino seleccionado');
      this.fetchRealRoute();
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        this.originLat = lat; this.originLng = lng;
        this.map.setView([lat, lng], 13);
        if (this.originMarker) this.map.removeLayer(this.originMarker);
        this.originMarker = L.circleMarker([lat, lng], {
          radius: 9, color: '#0d7377', fillColor: '#0d7377', fillOpacity: 1, weight: 3,
        }).addTo(this.map).bindPopup('📍 Tú estás aquí');
      }, () => {});
    }
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  // ── AUTOCOMPLETE con debounce 400ms usando Nominatim OSM ──
  onType(): void {
    this.routeInfo = null;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.destination.length < 2) { this.suggestions = []; this.searching = false; return; }

    this.searching = true;
    this.showSuggestions = true;

    this.searchTimer = setTimeout(() => this.runNominatim(), 400);
  }

  private async runNominatim(): Promise<void> {
    try {
      const q = encodeURIComponent(this.destination);
      const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=do&addressdetails=1&accept-language=es`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es', 'User-Agent': 'SafeRoutesGuardian/1.0' }
      });
      const data: NominatimResult[] = await res.json();
      this.zone.run(() => {
        this.suggestions = data.map(r => ({
          shortName: r.display_name.split(',')[0],
          fullAddress: r.display_name.split(',').slice(1, 3).join(',').trim(),
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }));
        this.searching = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.zone.run(() => {
        this.suggestions = [];
        this.searching = false;
        this.cdr.detectChanges();
      });
    }
  }

  onFocus(): void { if (this.destination.length > 1) this.showSuggestions = true; }
  onBlur(): void  { setTimeout(() => { this.showSuggestions = false; }, 200); }

  selectSuggestion(s: { shortName: string; fullAddress: string; lat: number; lng: number }): void {
    this.destination = s.shortName;
    this.destLat = s.lat; this.destLng = s.lng;
    this.showSuggestions = false; this.suggestions = [];
    this.placeDestMarker(s.lat, s.lng, s.shortName);
    if (this.map) this.map.setView([s.lat, s.lng], 14);
    this.fetchRealRoute();
  }

  selectRecent(r: typeof RECENTS[0]): void {
    this.destination = r.name;
    this.destLat = r.lat; this.destLng = r.lng;
    this.showSuggestions = false; this.suggestions = [];
    this.placeDestMarker(r.lat, r.lng, r.name);
    if (this.map) this.map.setView([r.lat, r.lng], 14);
    this.fetchRealRoute();
  }

  locateMe(): void {
    if (!this.map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          this.zone.run(() => {
            this.originLat = lat; this.originLng = lng;
            this.origin = `Mi ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            this.map.setView([lat, lng], 15);
            this.cdr.detectChanges();
          });
        },
        () => {
          // GPS denied/unavailable — center to Santo Domingo default
          this.zone.run(() => {
            this.map.setView([this.originLat, this.originLng], 14);
            this.cdr.detectChanges();
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      this.map.setView([this.originLat, this.originLng], 14);
    }
  }

  clearDest(): void {
    this.destination = ''; this.destLat = null; this.destLng = null;
    this.suggestions = []; this.routeInfo = null;
    if (this.destMarker) { this.map.removeLayer(this.destMarker); this.destMarker = undefined; }
    if (this.routeLine)  { this.map.removeLayer(this.routeLine);  this.routeLine  = undefined; }
  }

  private placeDestMarker(lat: number, lng: number, label: string): void {
    if (this.destMarker) this.map.removeLayer(this.destMarker);
    const div = document.createElement('div');
    div.innerHTML = '🏁';
    div.style.cssText = 'font-size:24px;line-height:1';
    this.destMarker = L.marker([lat, lng], {
      icon: L.divIcon({ html: div.outerHTML, className: '', iconSize: [28, 28], iconAnchor: [14, 28] }),
    }).addTo(this.map).bindPopup('🏁 ' + label).openPopup();
  }

  // ── OSRM — usa .then()/.catch() para que NgZone detecte cambios correctamente ──
  private fetchRealRoute(): void {
    if (!this.destLat || !this.destLng) return;
    this.zone.run(() => { this.loadingRoute = true; this.cdr.detectChanges(); });
    if (this.routeLine) { this.map.removeLayer(this.routeLine); this.routeLine = undefined; }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://router.project-osrm.org/route/v1/driving/`
      + `${this.originLng},${this.originLat};${this.destLng},${this.destLat}`
      + `?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        this.zone.run(() => {
          if (data.code === 'Ok' && data.routes?.length > 0) {
            const route = data.routes[0];
            const coords: L.LatLngTuple[] = route.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as L.LatLngTuple
            );
            this.routeLine = L.polyline(coords, { color: '#0d7377', weight: 5, opacity: .9 }).addTo(this.map);
            this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });
            this.routeInfo = {
              dist: (route.distance / 1000).toFixed(1),
              mins: Math.round(route.duration / 60),
            };
          }
          this.loadingRoute = false;
          this.cdr.detectChanges();
        });
      })
      .catch(() => {
        clearTimeout(timeoutId);
        this.zone.run(() => {
          if (this.destLat && this.destLng) {
            this.routeLine = L.polyline(
              [[this.originLat, this.originLng], [this.destLat, this.destLng]],
              { color: '#0d7377', weight: 4, opacity: .7, dashArray: '8,6' }
            ).addTo(this.map);
            this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });
            const dist = this.map.distance(
              [this.originLat, this.originLng], [this.destLat!, this.destLng!]
            );
            this.routeInfo = { dist: (dist / 1000).toFixed(1), mins: Math.round(dist / 500) };
          }
          this.loadingRoute = false;
          this.cdr.detectChanges();
        });
      });
  }

  onNext(): void {
    if (!this.destination || this.loadingRoute) return;
    this.router.navigate(['/map/search'], {
      queryParams: {
        dest: this.destination,
        lat: this.destLat, lng: this.destLng,
        dist: this.routeInfo?.dist,
        mins: this.routeInfo?.mins,
      },
    });
  }
}

import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewEncapsulation, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteService } from '../../shared/services/route.service';
import { GpsService, GpsPosition } from '../../shared/services/gps.service';
import * as L from 'leaflet';

// ── Helpers ───────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180)
          - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function bearingToEmoji(deg: number): string {
  const icons = ['⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️'];
  return icons[Math.round(deg / 45) % 8];
}

interface OsrmStep {
  maneuver: { type: string; modifier?: string; bearing_after?: number };
  name: string;
  distance: number;
}

// ─────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-active-route',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <div class="ar">

      <!-- ── Map: tilt layer (3D perspective) then rotate layer (heading-up) ── -->
      <div class="ar__tilt" [class.ar__tilt--3d]="is3D">
        <div class="ar__rotate" [style.transform]="rotateTransform">
          <div id="active-map" class="ar__map"></div>
        </div>
      </div>

      <!-- ── Top instruction card ── -->
      <div class="ar__top">
        <div class="ar__instruction">
          <div class="ar__maneuver">{{ maneuverIcon }}</div>
          <div class="ar__turn-info">
            <div class="ar__turn-dist">{{ nextTurnDist }}</div>
            <div class="ar__turn-street">{{ nextTurnStreet }}</div>
          </div>
          <button class="ar__close" (click)="onStop()">✕</button>
        </div>
        <div class="ar__progress-bar">
          <div class="ar__progress-fill" [style.width.%]="progressPct"></div>
        </div>
      </div>

      <!-- ── Right controls: compass · 2D/3D · speed ── -->
      <div class="ar__controls">
        <!-- Compass (always shows real North) -->
        <button class="ar__ctrl" (click)="toggleHeadingUp()"
                [class.ar__ctrl--active]="headingUp" title="Modo heading-up">
          <div class="ar__compass" [style.transform]="compassRotate">
            <span class="ar__compass-n">N</span>
            <span class="ar__compass-arr">▲</span>
          </div>
        </button>

        <!-- 2D / 3D toggle -->
        <button class="ar__ctrl ar__ctrl--mode" (click)="toggle3D()">
          {{ is3D ? '2D' : '3D' }}
        </button>

        <!-- Speedometer -->
        <div class="ar__speed">
          <span class="ar__speed-val">{{ speedKmh }}</span>
          <span class="ar__speed-unit">km/h</span>
        </div>
      </div>

      <!-- ── Alert bar ── -->
      <div class="ar__alert" *ngIf="showAlert">
        ⚠️ Bache reportado a 500 m — preparándose para desvío
      </div>

      <!-- ── Status badge ── -->
      <div class="ar__badge"
           [class.ar__badge--real]="gpsReady && isRealGps"
           [class.ar__badge--sim]="gpsReady && !isRealGps">
        <ng-container *ngIf="!gpsReady">
          <span class="ar__spin"></span> Obteniendo GPS...
        </ng-container>
        <ng-container *ngIf="gpsReady && isRealGps">📡 GPS real activo</ng-container>
        <ng-container *ngIf="gpsReady && !isRealGps">🎬 Modo simulación</ng-container>
      </div>

      <!-- ── Bottom ETA panel ── -->
      <div class="ar__bottom">
        <div class="ar__eta">
          <div class="ar__eta-block">
            <span class="ar__eta-val">{{ elapsedLabel }}</span>
            <span class="ar__eta-lbl">transcurrido</span>
          </div>
          <div class="ar__eta-sep"></div>
          <div class="ar__eta-block">
            <span class="ar__eta-val">{{ remainingKm.toFixed(1) }} km</span>
            <span class="ar__eta-lbl">restantes</span>
          </div>
          <div class="ar__eta-sep"></div>
          <div class="ar__eta-block ar__eta-block--teal">
            <span class="ar__eta-val">{{ arrivalTime }}</span>
            <span class="ar__eta-lbl">llegada est.</span>
          </div>
        </div>
        <button class="ar__stop" (click)="onStop()">Finalizar navegación</button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Base ── */
    .ar {
      position: relative;
      height: 100vh; height: 100dvh; width: 100%;
      overflow: hidden;
      background: #0e1520;
      font-family: -apple-system, 'Segoe UI', sans-serif;
    }

    /* ── Map tilt wrapper (3D perspective effect) ── */
    .ar__tilt {
      position: absolute;
      /* Oversized to prevent blank corners during CSS rotation */
      top: -35%; left: -35%;
      width: 170%; height: 170%;
      z-index: 1;
      transition: transform .5s cubic-bezier(.25,.46,.45,.94);
      transform-origin: 50% 65%;
    }
    .ar__tilt--3d {
      transform: perspective(700px) rotateX(44deg);
    }

    /* ── Map rotation wrapper (heading-up) ── */
    .ar__rotate {
      width: 100%; height: 100%;
      transition: transform .35s ease-out;
    }

    /* ── Leaflet map ── */
    .ar__map { width: 100%; height: 100%; }

    /* ── Top instruction card ── */
    .ar__top {
      position: absolute; top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 50px 14px 0;
    }
    .ar__instruction {
      background: rgba(6, 13, 26, 0.12);
      backdrop-filter: blur(24px) saturate(260%) brightness(1.06);
      -webkit-backdrop-filter: blur(24px) saturate(260%) brightness(1.06);
      border: 1px solid rgba(255,255,255,.38);
      box-shadow: 0 10px 40px rgba(0,0,0,.28), inset 0 1.5px 0 rgba(255,255,255,.45);
      border-radius: 20px;
      padding: 14px 14px 14px 14px;
      display: flex; align-items: center; gap: 12px;
    }
    .ar__maneuver {
      width: 52px; height: 52px; flex-shrink: 0;
      background: rgba(13,185,150,.2);
      border: 1.5px solid rgba(13,185,150,.4);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px;
    }
    .ar__turn-info { flex: 1; min-width: 0; }
    .ar__turn-dist {
      font-size: 11px; color: rgba(255,255,255,.4);
      margin-bottom: 3px; font-weight: 600;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .ar__turn-street {
      font-size: 15px; font-weight: 700; color: #fff;
      line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ar__close {
      flex-shrink: 0;
      width: 34px; height: 34px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.16);
      color: rgba(255,255,255,.7); border-radius: 50%;
      cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      font-family: inherit;
    }

    /* Progress bar */
    .ar__progress-bar {
      height: 3px; background: rgba(255,255,255,.07);
      border-radius: 2px; margin: 8px 0 0; overflow: hidden;
    }
    .ar__progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0db9c6 0%, #d4a843 100%);
      transition: width .9s ease;
    }

    /* ── Right-side controls ── */
    .ar__controls {
      position: absolute;
      right: 14px; top: 50%; transform: translateY(-50%);
      z-index: 1000;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    .ar__ctrl {
      width: 48px; height: 48px;
      background: rgba(6, 13, 26, 0.10);
      backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      -webkit-backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      border: 1px solid rgba(255,255,255,.38);
      box-shadow: 0 4px 16px rgba(0,0,0,.22), inset 0 1.5px 0 rgba(255,255,255,.42);
      border-radius: 14px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      cursor: pointer; font-family: inherit; gap: 1px;
    }
    .ar__ctrl--active {
      border-color: rgba(13,185,150,.5);
      background: rgba(13,115,119,.45);
      box-shadow: 0 4px 16px rgba(13,185,150,.2), inset 0 1px 0 rgba(255,255,255,.12);
    }
    .ar__ctrl--mode {
      font-size: 13px; font-weight: 800; color: rgba(255,255,255,.9);
      letter-spacing: -.3px;
    }

    /* Compass */
    .ar__compass {
      display: flex; flex-direction: column; align-items: center;
      transition: transform .35s ease;
      line-height: 1;
    }
    .ar__compass-n {
      font-size: 10px; font-weight: 900;
      color: rgba(231,76,60,.95);
    }
    .ar__compass-arr {
      font-size: 16px; color: rgba(255,255,255,.85);
      margin-top: -2px;
    }

    /* Speedometer */
    .ar__speed {
      width: 48px;
      background: rgba(6, 13, 26, 0.10);
      backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      -webkit-backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      border: 1px solid rgba(13,185,150,.40);
      box-shadow: 0 4px 16px rgba(0,0,0,.18), inset 0 1.5px 0 rgba(255,255,255,.30);
      border-radius: 14px;
      padding: 8px 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .ar__speed-val {
      font-size: 17px; font-weight: 800;
      color: rgba(13,185,150,.95); line-height: 1;
    }
    .ar__speed-unit {
      font-size: 8px; color: rgba(255,255,255,.3);
      margin-top: 2px;
    }

    /* ── Alert ── */
    .ar__alert {
      position: absolute; top: 150px; left: 14px; right: 72px;
      z-index: 1000;
      background: rgba(230,126,34,.82);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(230,126,34,.5);
      color: #fff; font-size: 12px; font-weight: 600;
      padding: 9px 12px; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(230,126,34,.3);
      animation: arSlide .3s ease;
    }
    @keyframes arSlide {
      from { opacity:0; transform:translateY(-8px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ── Status badge ── */
    .ar__badge {
      position: absolute; bottom: 178px; left: 50%; transform: translateX(-50%);
      z-index: 1000;
      background: rgba(6, 13, 26, 0.10);
      backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      -webkit-backdrop-filter: blur(20px) saturate(260%) brightness(1.06);
      border: 1px solid rgba(255,255,255,.32);
      box-shadow: inset 0 1.5px 0 rgba(255,255,255,.30);
      color: rgba(255,255,255,.85); font-size: 11px;
      padding: 5px 14px; border-radius: 100px;
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap;
    }
    .ar__badge--real {
      background: rgba(13,115,119,.5);
      border-color: rgba(13,185,150,.3);
    }
    .ar__badge--sim {
      background: rgba(100,60,200,.45);
      border-color: rgba(150,100,230,.35);
    }
    .ar__spin {
      width: 10px; height: 10px;
      border: 2px solid rgba(255,255,255,.2);
      border-top-color: rgba(13,185,150,.9);
      border-radius: 50%; animation: arSpin .7s linear infinite;
      display: inline-block; flex-shrink: 0;
    }
    @keyframes arSpin { to { transform: rotate(360deg); } }

    /* ── Car marker animations (global, used inside divIcon HTML) ── */
    @keyframes arCarPulse {
      0%   { transform: scale(.75); opacity: .5; }
      70%  { transform: scale(1.7); opacity: 0; }
      100% { transform: scale(1.7); opacity: 0; }
    }

    /* ── Bottom ETA panel ── */
    .ar__bottom {
      position: absolute; bottom: 0; left: 0; right: 0;
      z-index: 1000;
      background: rgba(6, 13, 26, 0.12);
      backdrop-filter: blur(24px) saturate(260%) brightness(1.06);
      -webkit-backdrop-filter: blur(24px) saturate(260%) brightness(1.06);
      border-top: 1px solid rgba(255,255,255,.30);
      box-shadow: 0 -8px 40px rgba(0,0,0,.22), inset 0 1.5px 0 rgba(255,255,255,.40);
      border-radius: 28px 28px 0 0;
      padding: 16px 16px calc(22px + env(safe-area-inset-bottom, 0px));
    }
    .ar__eta {
      display: flex; align-items: center; margin-bottom: 14px;
    }
    .ar__eta-block { flex: 1; text-align: center; }
    .ar__eta-block--teal .ar__eta-val { color: rgba(13,185,150,.95); }
    .ar__eta-val {
      display: block; font-size: 20px; font-weight: 800;
      color: rgba(255,255,255,.92); line-height: 1;
    }
    .ar__eta-lbl { font-size: 10px; color: rgba(255,255,255,.28); margin-top: 3px; }
    .ar__eta-sep { width: 1px; height: 36px; background: rgba(255,255,255,.09); }

    .ar__stop {
      width: 100%; padding: 14px;
      background: rgba(231,76,60,.6);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(231,76,60,.35);
      box-shadow: 0 4px 20px rgba(231,76,60,.25), inset 0 1.5px 0 rgba(255,255,255,.1);
      color: #fff; border-radius: 100px;
      font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
    }
  `],
})
export class ActiveRouteComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── UI state ──────────────────────────────────────────────────────
  elapsedLabel  = '00:00';
  remainingKm   = 5.2;
  totalKm       = 5.2;
  arrivalTime   = '';
  showAlert     = false;
  progressPct   = 0;
  gpsReady      = false;
  isRealGps     = false;
  speedKmh      = 0;

  // Navigation
  maneuverIcon    = '⬆️';
  nextTurnDist    = 'Calculando...';
  nextTurnStreet  = 'Buscando ruta...';

  // Map mode
  is3D        = true;    // Start in 3D like Waze
  headingUp   = true;    // Direction of travel always up
  currentBearing = 0;

  get rotateTransform(): string {
    return this.headingUp ? `rotate(${-this.currentBearing}deg)` : 'rotate(0deg)';
  }
  // Compass counter-rotates so N always points to actual North
  get compassRotate(): string {
    return this.headingUp ? `rotate(${this.currentBearing}deg)` : 'rotate(0deg)';
  }

  // ── Route params ──────────────────────────────────────────────────
  private destLabel = 'Destino';
  private routeName = 'Ruta Óptima';
  private distKm    = 5.2;
  private minsEst   = 14;
  private destLat   = 18.4701;
  private destLng   = -69.9312;

  // ── Leaflet ───────────────────────────────────────────────────────
  private map!: L.Map;
  private routeCoords: [number, number][] = [];
  private remainingLine?: L.Polyline;
  private userMarker?: L.Marker;
  private currentSegIdx = 0;
  private osrmSteps: OsrmStep[] = [];

  // ── Timers / subs ─────────────────────────────────────────────────
  private timer?: ReturnType<typeof setInterval>;
  private secs   = 0;
  private gpsSub: any;

  // ── Simulation ────────────────────────────────────────────────────
  private simRunning  = false;
  private simIdx      = 0;
  private simTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private routeService: RouteService,
    private gpsService: GpsService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const p = this.activatedRoute.snapshot.queryParamMap;
    if (p.get('dest'))  this.destLabel = p.get('dest')!;
    if (p.get('route')) this.routeName = p.get('route')!;
    if (p.get('dist'))  this.distKm   = parseFloat(p.get('dist')!)  || 5.2;
    if (p.get('mins'))  this.minsEst  = parseFloat(p.get('mins')!)  || 14;
    if (p.get('dlat'))  this.destLat  = parseFloat(p.get('dlat')!)  || this.destLat;
    if (p.get('dlng'))  this.destLng  = parseFloat(p.get('dlng')!)  || this.destLng;

    this.totalKm     = this.distKm;
    this.remainingKm = this.distKm;
    this.updateArrival(this.minsEst);

    // Elapsed clock
    this.timer = setInterval(() => {
      this.secs++;
      const m = Math.floor(this.secs / 60);
      const s = this.secs % 60;
      this.elapsedLabel = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (this.secs === 30) this.showAlert = true;
      if (this.secs === 36) this.showAlert = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 600); }

  ngOnDestroy(): void {
    this.simRunning = false;
    if (this.map)     this.map.remove();
    if (this.timer)   clearInterval(this.timer);
    if (this.gpsSub)  this.gpsSub.unsubscribe();
    if (this.simTimer) clearTimeout(this.simTimer);
    this.gpsService.stopWatch();
  }

  // ── Toggle actions ────────────────────────────────────────────────
  toggle3D(): void {
    this.is3D = !this.is3D;
    setTimeout(() => this.map?.invalidateSize(), 500);
  }

  toggleHeadingUp(): void {
    this.headingUp = !this.headingUp;
    // Refresh marker orientation
    this.refreshCarMarker();
  }

  // ── Map init ──────────────────────────────────────────────────────
  private async initMap(): Promise<void> {
    const el = document.getElementById('active-map');
    if (!el) return;

    const { pos: initPos, error } = await this.gpsService.requestOnce();
    this.gpsReady  = true;
    this.isRealGps = error === 'none';

    this.map = L.map(el, {
      center:           [initPos.lat, initPos.lng],
      zoom:             17,
      zoomControl:      false,
      attributionControl: false,
    });

    // CartoDB dark tiles — Waze-like dark map
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    ).addTo(this.map);

    this.placeCarMarker(initPos.lat, initPos.lng, 0);
    await this.fetchOsrmRoute(initPos.lat, initPos.lng, this.destLat, this.destLng);

    if (this.isRealGps) {
      // Real GPS continuous watch
      this.gpsService.startWatch();
      this.gpsSub = this.gpsService.position.subscribe((pos: GpsPosition) => {
        if (pos.accuracy === 0) return;
        this.onPositionUpdate(pos.lat, pos.lng);
      });
    } else {
      // Animate along route in simulation mode
      this.startSimulation();
    }

    setTimeout(() => this.map?.invalidateSize(), 300);
    setTimeout(() => this.map?.invalidateSize(), 800);
    setTimeout(() => this.map?.invalidateSize(), 1500);
    this.cdr.detectChanges();
  }

  // ── OSRM route fetch ──────────────────────────────────────────────
  private async fetchOsrmRoute(
    olat: number, olng: number, dlat: number, dlng: number,
  ): Promise<void> {
    const url = `https://router.project-osrm.org/route/v1/driving/`
      + `${olng},${olat};${dlng},${dlat}`
      + `?overview=full&geometries=geojson&steps=true`;
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 8000);
      const res  = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      const data = await res.json();

      if (data.routes?.[0]) {
        const r = data.routes[0];
        this.routeCoords = (r.geometry.coordinates as [number,number][])
          .map(c => [c[1], c[0]] as [number,number]);
        this.totalKm     = parseFloat((r.distance / 1000).toFixed(2));
        this.remainingKm = this.totalKm;
        this.distKm      = this.totalKm;
        this.updateArrival(Math.round(r.duration / 60));
        if (r.legs?.[0]?.steps) this.osrmSteps = r.legs[0].steps;
        this.nextTurnStreet = `Hacia ${this.destLabel}`;
        this.drawRoute();
        return;
      }
    } catch { /* timeout / network */ }

    // Fallback straight line
    this.routeCoords = [[olat, olng], [dlat, dlng]];
    this.nextTurnStreet = this.destLabel;
    this.drawRoute();
  }

  // ── Draw route on map ─────────────────────────────────────────────
  private drawRoute(): void {
    if (!this.routeCoords.length || !this.map) return;

    // Outer glow / white border
    L.polyline(this.routeCoords, { color: '#ffffff', weight: 11, opacity: .12 }).addTo(this.map);
    // Grey full-route ghost
    L.polyline(this.routeCoords, { color: '#5a6a7a', weight:  7, opacity: .35 }).addTo(this.map);
    // Active teal route line
    this.remainingLine = L.polyline(this.routeCoords, {
      color: '#00c8d4', weight: 7, opacity: .95,
    }).addTo(this.map);

    // Destination pin
    const dest = this.routeCoords[this.routeCoords.length - 1];
    L.divIcon({});
    const destIcon = L.divIcon({
      html: `<div style="
        width:38px;height:38px;
        background:#d4a843;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);border:3px solid #fff;
        box-shadow:0 4px 14px rgba(0,0,0,.5);
        display:flex;align-items:center;justify-content:center;
      "><span style="transform:rotate(45deg);font-size:18px;line-height:32px">🏁</span></div>`,
      className: '',
      iconSize:   [38, 38],
      iconAnchor: [10, 38],
    });
    L.marker(dest, { icon: destIcon }).addTo(this.map).bindPopup(`🏁 ${this.destLabel}`);

    // Briefly fit full route, then zoom in on start
    this.map.fitBounds(L.latLngBounds(this.routeCoords), { padding: [70, 70] });
    setTimeout(() => {
      if (this.routeCoords.length > 0) {
        this.map.setView(this.routeCoords[0], 17, { animate: true, duration: 1 });
      }
    }, 1800);

    this.updateTurnInstruction();
    this.cdr.detectChanges();
  }

  // ── Simulation: animate along route ──────────────────────────────
  private startSimulation(): void {
    if (this.routeCoords.length < 2) return;
    this.simIdx     = 0;
    this.simRunning = true;
    this.stepSim();
  }

  private stepSim(): void {
    if (!this.simRunning || this.simIdx >= this.routeCoords.length - 1) {
      this.simRunning = false;
      return;
    }
    const [lat, lng]   = this.routeCoords[this.simIdx];
    const [nlat, nlng] = this.routeCoords[this.simIdx + 1];

    // Bearing for this segment
    const bearing = calcBearing(lat, lng, nlat, nlng);
    // Simulated speed: 40 km/h city
    const segKm  = haversineKm(lat, lng, nlat, nlng);
    const segMs  = Math.round((segKm * 1000 / 11.1) * 1000); // 40 km/h = 11.1 m/s

    // Randomise speed display slightly
    this.speedKmh = Math.round(38 + Math.random() * 8);
    this.currentBearing = bearing;

    this.onPositionUpdate(lat, lng, bearing);
    this.simIdx++;

    const delay = Math.min(Math.max(segMs, 60), 700);
    this.simTimer = setTimeout(() => this.stepSim(), delay);
  }

  // ── Core position update (GPS or simulation) ──────────────────────
  private onPositionUpdate(lat: number, lng: number, forceBearing?: number): void {
    if (!this.map) return;

    // Bearing
    if (forceBearing !== undefined) {
      this.currentBearing = forceBearing;
    } else if (this.routeCoords.length > 1 && this.currentSegIdx < this.routeCoords.length - 1) {
      const c = this.routeCoords[this.currentSegIdx];
      const n = this.routeCoords[Math.min(this.currentSegIdx + 1, this.routeCoords.length - 1)];
      this.currentBearing = calcBearing(c[0], c[1], n[0], n[1]);
    }

    // Update car marker
    this.updateCarMarker(lat, lng, this.currentBearing);

    // Smooth camera follow — offset vertically so road ahead is more visible
    const offsetLat = this.is3D
      ? lat - 0.0003 * Math.cos(this.currentBearing * Math.PI / 180)
      : lat;
    this.map.setView([offsetLat, lng], 17, { animate: true, duration: 0.4 });

    // Route progress
    if (this.routeCoords.length > 0) {
      let minD = Infinity, nearIdx = this.currentSegIdx;
      const end = Math.min(this.currentSegIdx + 80, this.routeCoords.length);
      for (let i = this.currentSegIdx; i < end; i++) {
        const d = haversineKm(lat, lng, this.routeCoords[i][0], this.routeCoords[i][1]);
        if (d < minD) { minD = d; nearIdx = i; }
      }
      this.currentSegIdx = nearIdx;

      const rem: [number,number][] = [[lat, lng], ...this.routeCoords.slice(nearIdx)];
      this.remainingLine?.setLatLngs(rem);

      let remKm = 0;
      for (let i = 0; i < rem.length - 1; i++) {
        remKm += haversineKm(rem[i][0], rem[i][1], rem[i+1][0], rem[i+1][1]);
      }
      this.remainingKm = Math.max(0, remKm);
      this.progressPct = Math.min(100, ((this.totalKm - this.remainingKm) / this.totalKm) * 100);
      this.updateArrival(Math.round((this.remainingKm / 30) * 60));
      this.updateTurnInstruction();
    }

    this.cdr.detectChanges();
  }

  // ── Car marker (SVG arrow) ────────────────────────────────────────
  private carMarkerHtml(bearing: number): string {
    // When heading-up, map is already rotated — marker shows upright (bearing=0)
    const rot = this.headingUp ? 0 : bearing;
    return `
      <div style="position:relative;width:56px;height:56px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(0,200,212,.15);
          animation:arCarPulse 2s ease-out infinite
        "></div>
        <div style="
          position:absolute;inset:8px;border-radius:50%;
          background:rgba(0,200,212,.12);
          animation:arCarPulse 2s ease-out .6s infinite
        "></div>
        <div class="ar-car-inner" style="
          position:absolute;inset:0;
          display:flex;align-items:center;justify-content:center;
          transform:rotate(${rot}deg);
          transition:transform .3s ease;
        ">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <ellipse cx="18" cy="32" rx="11" ry="3.5" fill="rgba(0,0,0,0.3)"/>
            <path d="M18 3 L29 27 L18 22 L7 27 Z"
              fill="#00c8d4" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
            <circle cx="18" cy="21" r="3.5" fill="white" opacity=".85"/>
          </svg>
        </div>
      </div>`;
  }

  private placeCarMarker(lat: number, lng: number, bearing: number): void {
    if (!this.map) return;
    const icon = L.divIcon({
      html:       this.carMarkerHtml(bearing),
      className:  '',
      iconSize:   [56, 56],
      iconAnchor: [28, 28],
    });
    this.userMarker = L.marker([lat, lng], { icon, zIndexOffset: 9999 }).addTo(this.map);
  }

  private updateCarMarker(lat: number, lng: number, bearing: number): void {
    if (!this.map) return;
    if (!this.userMarker) { this.placeCarMarker(lat, lng, bearing); return; }

    this.userMarker.setLatLng([lat, lng]);

    // Rotate just the inner arrow (no need to recreate the whole icon)
    const el = this.userMarker.getElement();
    if (el) {
      const inner = el.querySelector('.ar-car-inner') as HTMLElement | null;
      if (inner) {
        const rot = this.headingUp ? 0 : bearing;
        inner.style.transform = `rotate(${rot}deg)`;
      }
    }
  }

  private refreshCarMarker(): void {
    // Re-render marker when heading-up mode toggles
    if (!this.userMarker) return;
    const ll = this.userMarker.getLatLng();
    this.updateCarMarker(ll.lat, ll.lng, this.currentBearing);
  }

  // ── Turn instructions ─────────────────────────────────────────────
  private updateTurnInstruction(): void {
    if (!this.routeCoords.length) return;

    // Use OSRM steps when available
    if (this.osrmSteps.length > 0) {
      const step = this.osrmSteps[Math.min(
        Math.floor(this.currentSegIdx / Math.max(1, Math.floor(this.routeCoords.length / this.osrmSteps.length))),
        this.osrmSteps.length - 1
      )];
      const next = this.osrmSteps[Math.min(
        Math.floor(this.currentSegIdx / Math.max(1, Math.floor(this.routeCoords.length / this.osrmSteps.length))) + 1,
        this.osrmSteps.length - 1
      )];
      this.maneuverIcon   = this.maneuverToIcon(next.maneuver.type, next.maneuver.modifier);
      this.nextTurnStreet = next.name || `Hacia ${this.destLabel}`;

      const distToNext = step.distance;
      this.nextTurnDist = distToNext < 200
        ? `En ${Math.round(distToNext)} m`
        : distToNext < 1000
          ? `En ${Math.round(distToNext)} m`
          : `En ${(distToNext / 1000).toFixed(1)} km`;
      return;
    }

    // Fallback: geometric
    const next = Math.min(this.currentSegIdx + 1, this.routeCoords.length - 1);
    const curr = this.routeCoords[this.currentSegIdx];
    const nxt  = this.routeCoords[next];
    const b    = calcBearing(curr[0], curr[1], nxt[0], nxt[1]);
    this.currentBearing  = b;
    this.maneuverIcon    = bearingToEmoji(b);
    const d              = haversineKm(curr[0], curr[1], nxt[0], nxt[1]);
    this.nextTurnDist    = d < 1 ? `En ${Math.round(d * 1000)} m` : `En ${d.toFixed(1)} km`;
    this.nextTurnStreet  = `Hacia ${this.destLabel}`;
  }

  private maneuverToIcon(type: string, modifier?: string): string {
    if (type === 'arrive')  return '🏁';
    if (type === 'depart')  return '🚀';
    if (type === 'roundabout' || type === 'rotary') return '🔄';
    if (modifier === 'uturn')       return '🔄';
    if (modifier === 'sharp left')  return '↩️';
    if (modifier === 'sharp right') return '↪️';
    if (modifier === 'left')        return '⬅️';
    if (modifier === 'right')       return '➡️';
    if (modifier === 'slight left') return '↖️';
    if (modifier === 'slight right')return '↗️';
    return '⬆️';
  }

  private updateArrival(mins: number): void {
    const t = new Date();
    t.setMinutes(t.getMinutes() + Math.max(0, mins));
    this.arrivalTime = t.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Stop navigation ───────────────────────────────────────────────
  onStop(): void {
    this.simRunning = false;
    const vehicle = this.routeService.currentVehicle;
    const labels: Record<string,string> = {
      sedan: 'Sedán', suv: 'SUV', moto: 'Motocicleta', pickup: 'Pick-up',
    };
    this.routeService.addTrip({
      origin:          'Tu ubicación',
      destination:     this.destLabel,
      vehicleType:     vehicle,
      vehicleLabel:    labels[vehicle] ?? vehicle,
      distanceKm:      parseFloat((this.totalKm - this.remainingKm).toFixed(2)),
      durationMinutes: Math.floor(this.secs / 60),
      routeName:       this.routeName,
    });
    this.router.navigate(['/map']);
  }
}

import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconsService {
  constructor(private sanitizer: DomSanitizer) {}

  safe(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // ── Bottom Nav ──────────────────────────────────────────────────────
  get navMap(): SafeHtml { return this.safe(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9 3v15M15 6v15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`);
  }
  get navSearch(): SafeHtml { return this.safe(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/>
      <path d="M15.5 15.5L20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 10.5h5M10.5 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`);
  }
  get navHistory(): SafeHtml { return this.safe(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 4v4h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 7v5l3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`);
  }
  get navProfile(): SafeHtml { return this.safe(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`);
  }

  // ── Vehículos ────────────────────────────────────────────────────────
  vehicleSvg(type: string): SafeHtml {
    const svgs: Record<string, string> = {
      sedan: `<svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="16" width="52" height="13" rx="4" fill="#0d7377"/>
        <path d="M12 16 L18 7 H46 L52 16Z" fill="#3a9fa3"/>
        <rect x="19" y="8" width="10" height="7" rx="2" fill="#d4f1f2" opacity=".9"/>
        <rect x="32" y="8" width="10" height="7" rx="2" fill="#d4f1f2" opacity=".9"/>
        <circle cx="17" cy="29" r="5" fill="#1a2a3a"/><circle cx="17" cy="29" r="2.5" fill="#4a5a6a"/>
        <circle cx="47" cy="29" r="5" fill="#1a2a3a"/><circle cx="47" cy="29" r="2.5" fill="#4a5a6a"/>
        <rect x="3" y="19" width="7" height="4" rx="1.5" fill="#d4a843"/>
        <rect x="54" y="19" width="7" height="4" rx="1.5" fill="#e74c3c"/>
      </svg>`,
      suv: `<svg viewBox="0 0 68 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="16" width="60" height="14" rx="4" fill="#065a5e"/>
        <path d="M8 16 L13 6 H55 L60 16Z" fill="#0d7377"/>
        <rect x="15" y="7" width="12" height="8" rx="2" fill="#d4f1f2" opacity=".9"/>
        <rect x="31" y="7" width="12" height="8" rx="2" fill="#d4f1f2" opacity=".9"/>
        <circle cx="16" cy="30" r="6" fill="#1a2a3a"/><circle cx="16" cy="30" r="3" fill="#4a5a6a"/>
        <circle cx="52" cy="30" r="6" fill="#1a2a3a"/><circle cx="52" cy="30" r="3" fill="#4a5a6a"/>
        <rect x="2" y="20" width="7" height="4" rx="1.5" fill="#d4a843"/>
        <rect x="59" y="20" width="7" height="4" rx="1.5" fill="#e74c3c"/>
      </svg>`,
      moto: `<svg viewBox="0 0 56 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="24" r="9" fill="#1a2a3a"/><circle cx="12" cy="24" r="5" fill="#4a5a6a"/><circle cx="12" cy="24" r="2" fill="#d4a843"/>
        <circle cx="44" cy="24" r="9" fill="#1a2a3a"/><circle cx="44" cy="24" r="5" fill="#4a5a6a"/><circle cx="44" cy="24" r="2" fill="#d4a843"/>
        <path d="M12 24 Q28 8 44 24" stroke="#d4a843" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M26 18 L30 10 L38 13 L35 20Z" fill="#d4a843"/>
        <circle cx="30" cy="11" r="4" fill="#1a2a3a"/><circle cx="30" cy="11" r="2" fill="#6c757d"/>
      </svg>`,
      pickup: `<svg viewBox="0 0 72 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="16" width="64" height="14" rx="4" fill="#1a6b2a"/>
        <path d="M8 16 L13 6 H40 L45 16Z" fill="#34c759"/>
        <rect x="46" y="12" width="22" height="4" rx="2" fill="#34c759" opacity=".4"/>
        <rect x="15" y="7" width="11" height="8" rx="2" fill="#d4f1f2" opacity=".9"/>
        <rect x="28" y="7" width="9" height="8" rx="2" fill="#d4f1f2" opacity=".9"/>
        <circle cx="16" cy="30" r="6" fill="#1a2a3a"/><circle cx="16" cy="30" r="3" fill="#4a5a6a"/>
        <circle cx="56" cy="30" r="6" fill="#1a2a3a"/><circle cx="56" cy="30" r="3" fill="#4a5a6a"/>
        <rect x="2" y="20" width="7" height="4" rx="1.5" fill="#d4a843"/>
        <rect x="63" y="20" width="7" height="4" rx="1.5" fill="#e74c3c"/>
      </svg>`,
    };
    return this.safe(svgs[type] ?? svgs['sedan']);
  }

  vehicleLabel(type: string): string {
    return { sedan: 'Sedán', suv: 'SUV', moto: 'Moto', pickup: 'Pick-up' }[type] ?? 'Sedán';
  }

  // ── Incidentes ───────────────────────────────────────────────────────
  incidentSvg(key: string): SafeHtml {
    const svgs: Record<string, string> = {
      bache: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="#fef3e8" stroke="#e67e22" stroke-width="2"/>
        <ellipse cx="18" cy="22" rx="9" ry="4.5" fill="#e67e22" opacity=".25"/>
        <ellipse cx="18" cy="22" rx="5.5" ry="2.5" fill="#e67e22" opacity=".5"/>
        <path d="M11 16 Q15 12 18 16 Q21 20 25 16" stroke="#e67e22" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M16 9 L18 13 L20 9" stroke="#e67e22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      inundacion: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="#eaf4fd" stroke="#3498db" stroke-width="2"/>
        <path d="M8 25 Q11 21 14 25 Q17 29 20 25 Q23 21 28 25" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M8 20 Q11 16 14 20 Q17 24 20 20 Q23 16 28 20" stroke="#3498db" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
        <path d="M18 7 L18 15 M15 10 L18 7 L21 10" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      obra: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="#fef9e7" stroke="#f39c12" stroke-width="2"/>
        <rect x="9" y="17" width="18" height="11" rx="2" fill="#f39c12" opacity=".2"/>
        <rect x="9" y="17" width="18" height="3.5" rx="1" fill="#f39c12"/>
        <rect x="12" y="20.5" width="3.5" height="7.5" fill="#f39c12" opacity=".7"/>
        <rect x="20.5" y="20.5" width="3.5" height="7.5" fill="#f39c12" opacity=".7"/>
        <path d="M15 9 L18 6 L21 9 L19.5 9 L19.5 17 L16.5 17 L16.5 9Z" fill="#e67e22"/>
      </svg>`,
      accidente: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="#fdecea" stroke="#e74c3c" stroke-width="2"/>
        <path d="M18 9 L20 15 H27 L21.5 19 L24 26 L18 22 L12 26 L14.5 19 L9 15 H16Z" fill="#e74c3c"/>
      </svg>`,
      semaforo: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="17" fill="#f5eef8" stroke="#9b59b6" stroke-width="2"/>
        <rect x="13" y="8" width="10" height="20" rx="3" fill="#1a2a3a"/>
        <circle cx="18" cy="13" r="3" fill="#e74c3c"/>
        <circle cx="18" cy="18" r="3" fill="#6c757d" opacity=".4"/>
        <circle cx="18" cy="23" r="3" fill="#6c757d" opacity=".4"/>
        <path d="M11 28 L25 8" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
    };
    return this.safe(svgs[key] ?? svgs['bache']);
  }

  // ── GPS marker HTML (para Leaflet divIcon) ───────────────────────────
  gpsMarkerHtml(): string {
    return `<div style="position:relative;width:44px;height:44px">
      <div style="position:absolute;inset:0;border-radius:50%;background:#0d7377;opacity:.15;animation:gpsp 1.8s ease-out infinite"></div>
      <div style="position:absolute;inset:8px;border-radius:50%;background:#0d7377;opacity:.25;animation:gpsp 1.8s ease-out .5s infinite"></div>
      <div style="position:absolute;inset:15px;border-radius:50%;background:#fff;border:3px solid #0d7377;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>
      <div style="position:absolute;inset:20px;border-radius:50%;background:#0d7377"></div>
      <style>@keyframes gpsp{0%{transform:scale(.8);opacity:.4}70%{transform:scale(1.8);opacity:0}100%{transform:scale(1.8);opacity:0}}</style>
    </div>`;
  }

  // ── Incident marker HTML (para Leaflet divIcon) ──────────────────────
  incidentMarkerHtml(icon: string): string {
    const map: Record<string, string> = {
      '🕳️': 'bache', '🌊': 'inundacion', '🏗️': 'obra', '🚗': 'accidente', '🚦': 'semaforo',
    };
    const svgs: Record<string, string> = {
      bache: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#fef3e8" stroke="#e67e22" stroke-width="2"/><ellipse cx="18" cy="22" rx="9" ry="4.5" fill="#e67e22" opacity=".25"/><path d="M11 16 Q15 12 18 16 Q21 20 25 16" stroke="#e67e22" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M16 9 L18 13 L20 9" stroke="#e67e22" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
      inundacion: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#eaf4fd" stroke="#3498db" stroke-width="2"/><path d="M8 25 Q11 21 14 25 Q17 29 20 25 Q23 21 28 25" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M8 20 Q11 16 14 20 Q17 24 20 20 Q23 16 28 20" stroke="#3498db" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/><path d="M18 7 L18 14" stroke="#3498db" stroke-width="2" stroke-linecap="round"/></svg>`,
      obra: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#fef9e7" stroke="#f39c12" stroke-width="2"/><rect x="9" y="17" width="18" height="3.5" rx="1" fill="#f39c12"/><rect x="12" y="20.5" width="3.5" height="7" fill="#f39c12" opacity=".7"/><rect x="20.5" y="20.5" width="3.5" height="7" fill="#f39c12" opacity=".7"/><path d="M15 9 L18 6 L21 9 L19.5 9 L19.5 17 L16.5 17 L16.5 9Z" fill="#e67e22"/></svg>`,
      accidente: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#fdecea" stroke="#e74c3c" stroke-width="2"/><path d="M18 9 L20 15 H27 L21.5 19 L24 26 L18 22 L12 26 L14.5 19 L9 15 H16Z" fill="#e74c3c"/></svg>`,
      semaforo: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#f5eef8" stroke="#9b59b6" stroke-width="2"/><rect x="13" y="8" width="10" height="20" rx="3" fill="#1a2a3a"/><circle cx="18" cy="13" r="3" fill="#e74c3c"/><circle cx="18" cy="18" r="3" fill="#6c757d" opacity=".4"/><circle cx="18" cy="23" r="3" fill="#6c757d" opacity=".4"/><path d="M11 28 L25 8" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    };
    const key = map[icon] ?? 'bache';
    return `<div style="width:36px;height:36px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))">${svgs[key]}</div>`;
  }
}

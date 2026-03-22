import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';

interface ToggleSetting { label: string; desc: string; icon: string; on: boolean; }
interface LinkSetting   { label: string; desc: string; icon: string; route: string; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, HeaderBarComponent, BottomNavComponent],
  template: `
    <div class="settings">
      <app-header-bar title="Configuración"></app-header-bar>

      <div class="settings__body">
        <div class="settings__section">
          <div class="settings__section-label">Navegación</div>
          <div class="settings__item" *ngFor="let s of navSettings">
            <span class="settings__icon">{{ s.icon }}</span>
            <div class="settings__info">
              <div class="settings__name">{{ s.label }}</div>
              <div class="settings__desc">{{ s.desc }}</div>
            </div>
            <div class="settings__toggle" [class.settings__toggle--on]="s.on" (click)="s.on = !s.on"></div>
          </div>
        </div>

        <div class="settings__section">
          <div class="settings__section-label">Notificaciones</div>
          <div class="settings__item" *ngFor="let s of notifSettings">
            <span class="settings__icon">{{ s.icon }}</span>
            <div class="settings__info">
              <div class="settings__name">{{ s.label }}</div>
              <div class="settings__desc">{{ s.desc }}</div>
            </div>
            <div class="settings__toggle" [class.settings__toggle--on]="s.on" (click)="s.on = !s.on"></div>
          </div>
        </div>

        <div class="settings__section">
          <div class="settings__section-label">Cuenta</div>
          <div class="settings__item settings__item--link" *ngFor="let s of linkSettings" (click)="go(s.route)">
            <span class="settings__icon">{{ s.icon }}</span>
            <div class="settings__info">
              <div class="settings__name">{{ s.label }}</div>
              <div class="settings__desc">{{ s.desc }}</div>
            </div>
            <span class="settings__arrow">›</span>
          </div>
        </div>

        <div class="settings__version">Safe Routes Guardian v1.0.0 · UNAPEC ISC615 · ENE-ABR 2026</div>
      </div>

      <app-bottom-nav active="profile"></app-bottom-nav>
    </div>
  `,
  styles: [`
    .settings {
      min-height: 100dvh; background: transparent;
      padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
    }
    .settings__body { padding: 12px 16px; }
    .settings__section { margin-bottom: 20px; }
    .settings__section-label {
      font-size: 11px; font-weight: 700; color: rgba(255,255,255,.38);
      text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px; padding: 0 4px;
    }
    .settings__item {
      background: rgba(255,255,255,.07);
      backdrop-filter: blur(24px) saturate(175%);
      -webkit-backdrop-filter: blur(24px) saturate(175%);
      border: 1px solid rgba(255,255,255,.11);
      box-shadow: 0 2px 12px rgba(0,0,0,.22), inset 0 1.5px 0 rgba(255,255,255,.1);
      border-radius: 16px; padding: 14px; margin-bottom: 6px;
      display: flex; align-items: center; gap: 12px;
      &--link { cursor: pointer; transition: background .15s;
        &:active { background: rgba(255,255,255,.11); }
      }
    }
    .settings__icon { font-size: 22px; width: 30px; text-align: center; flex-shrink: 0; }
    .settings__info { flex: 1; }
    .settings__name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.88); }
    .settings__desc { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 2px; }
    .settings__toggle {
      width: 46px; height: 26px;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 13px; position: relative; cursor: pointer;
      transition: background .2s, border-color .2s; flex-shrink: 0;
      &::after {
        content: ''; position: absolute; width: 20px; height: 20px;
        background: rgba(255,255,255,.85); border-radius: 50%;
        top: 2px; left: 2px; transition: transform .2s;
        box-shadow: 0 1px 4px rgba(0,0,0,.3);
      }
      &--on {
        background: rgba(13,115,119,.6);
        border-color: rgba(13,185,150,.4);
        box-shadow: 0 0 12px rgba(13,115,119,.4);
        &::after { transform: translateX(20px); background: #fff; }
      }
    }
    .settings__arrow { font-size: 18px; color: rgba(255,255,255,.25); }
    .settings__version {
      text-align: center; font-size: 11px; color: rgba(255,255,255,.2);
      padding: 20px 0 8px;
    }
  `],
})
export class SettingsComponent {
  navSettings: ToggleSetting[] = [
    { icon: '🚫', label: 'Evitar calles no pavimentadas', desc: 'Rutas solo por asfalto',            on: true  },
    { icon: '🕳️', label: 'Alertas de baches en tiempo real', desc: 'Notificar baches en la ruta',   on: true  },
    { icon: '🏗️', label: 'Evitar zonas de obras',            desc: 'Desviar por obras activas',      on: false },
    { icon: '🌊', label: 'Evitar zonas inundables',          desc: 'Activar en temporada de lluvia', on: false },
    { icon: '🔄', label: 'Recalcular ruta automáticamente',  desc: 'Al detectar incidente',          on: true  },
  ];

  notifSettings: ToggleSetting[] = [
    { icon: '🔔', label: 'Notificaciones push',    desc: 'Alertas de ruta y tráfico',   on: true  },
    { icon: '📧', label: 'Notificaciones por email', desc: 'Resumen semanal de rutas',  on: false },
    { icon: '🌙', label: 'Modo no molestar',        desc: 'Silenciar entre 10pm y 7am', on: false },
  ];

  linkSettings: LinkSetting[] = [
    { icon: '✏️', label: 'Editar perfil',     desc: 'Nombre, email, teléfono',     route: '/profile/edit'    },
    { icon: '🚗', label: 'Cambiar vehículo',  desc: 'Actualizar tipo de vehículo', route: '/auth/vehicle-selection' },
    { icon: '💬', label: 'Soporte',           desc: 'Contactar al equipo',         route: '/profile/support' },
  ];

  constructor(private router: Router) {}
  go(route: string): void { this.router.navigate([route]); }
}

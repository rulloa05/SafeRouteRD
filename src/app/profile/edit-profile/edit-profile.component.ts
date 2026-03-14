import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { IconInputComponent } from '../../shared/ui/icon-input/icon-input.component';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { AuthService } from '../../shared/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderBarComponent, IconInputComponent, PillButtonComponent, BottomNavComponent],
  template: `
    <div class="edit">
      <app-header-bar title="Editar Perfil"></app-header-bar>

      <div class="edit__avatar-section">
        <div class="edit__avatar">
          <span class="edit__avatar-letter">{{ initials }}</span>
          <button class="edit__avatar-btn" (click)="showToast()">📷</button>
        </div>
        <div class="edit__avatar-name">{{ form.get('fullName')?.value || 'Tu nombre' }}</div>
        <div class="edit__avatar-vehicle">{{ vehicleLabel }}</div>
      </div>

      <div class="edit__toast" *ngIf="toastMsg">{{ toastMsg }}</div>

      <form [formGroup]="form" (ngSubmit)="onSave()" class="edit__form">
        <div class="edit__section-label">Información personal</div>

        <app-icon-input icon="person" placeholder="Nombre completo"
          formControlName="fullName" [showError]="hasError('fullName')" errorMessage="Requerido">
        </app-icon-input>
        <app-icon-input icon="envelope" placeholder="Correo electrónico" type="email"
          formControlName="email" [showError]="hasError('email')" errorMessage="Correo inválido">
        </app-icon-input>
        <app-icon-input icon="telephone" placeholder="Teléfono" type="tel"
          formControlName="phone" [showError]="hasError('phone')" errorMessage="Requerido">
        </app-icon-input>
        <app-icon-input icon="calendar-event" placeholder="Fecha de nacimiento"
          formControlName="dateOfBirth" [showError]="hasError('dateOfBirth')" errorMessage="Requerido">
        </app-icon-input>
        <app-icon-input icon="geo-alt" placeholder="Ciudad / Sector"
          formControlName="stateCity" [showError]="hasError('stateCity')" errorMessage="Requerido">
        </app-icon-input>

        <div class="edit__btn-row">
          <app-pill-button variant="primary" type="submit" [block]="true" [disabled]="loading || form.invalid">
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </app-pill-button>
        </div>
      </form>

      <div class="edit__danger-zone">
        <div class="edit__section-label">Zona peligrosa</div>
        <button class="edit__logout-btn" (click)="onLogout()">Cerrar sesión</button>
      </div>

      <app-bottom-nav active="profile"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .edit { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .edit__avatar-section { display: flex; flex-direction: column; align-items: center; padding: 24px 16px 16px; background: $color-white; border-bottom: 1px solid $color-gray-200; }
    .edit__avatar { position: relative; margin-bottom: 10px; }
    .edit__avatar-letter { width: 72px; height: 72px; border-radius: 50%; background: $color-primary; color: $color-white; font-size: 28px; font-weight: $font-weight-bold; display: flex; align-items: center; justify-content: center; }
    .edit__avatar-btn { position: absolute; bottom: 0; right: -4px; width: 28px; height: 28px; border-radius: 50%; background: $color-accent-gold; border: 2px solid $color-white; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .edit__avatar-name { font-size: $font-size-md; font-weight: $font-weight-bold; color: $color-gray-800; }
    .edit__avatar-vehicle { font-size: $font-size-sm; color: $color-primary; margin-top: 2px; }
    .edit__toast { background: $color-primary; color: $color-white; text-align: center; font-size: $font-size-sm; padding: 10px; animation: fadeOut 2.5s forwards; }
    @keyframes fadeOut { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
    .edit__form { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .edit__section-label { font-size: 11px; font-weight: $font-weight-bold; color: $color-gray-500; text-transform: uppercase; letter-spacing: .6px; padding: 0 16px; margin: 8px 0 4px; }
    .edit__btn-row { margin-top: 8px; }
    .edit__danger-zone { padding: 0 16px 24px; }
    .edit__logout-btn { width: 100%; padding: 14px; background: transparent; border: 1.5px solid $color-accent-red; color: $color-accent-red; border-radius: $radius-pill; font-size: $font-size-base; font-weight: $font-weight-semibold; cursor: pointer; &:hover { background: rgba($color-accent-red, .06); } }
  `],
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  toastMsg = '';
  initials = 'U';
  vehicleLabel = 'Sedán 🚗';

  private readonly vehicleLabels: Record<string, string> = {
    sedan: 'Sedán 🚗', suv: 'SUV / 4x4 🚙', moto: 'Motocicleta 🏍️', pickup: 'Pick-up 🚚',
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.form = this.fb.group({
        fullName:    [user?.fullName    ?? '', Validators.required],
        email:       [user?.email       ?? '', [Validators.required, Validators.email]],
        phone:       [user?.phone       ?? '', Validators.required],
        dateOfBirth: [user?.dateOfBirth ?? '', Validators.required],
        stateCity:   [user?.stateCity   ?? '', Validators.required],
      });
      const name = user?.fullName ?? '';
      this.initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
      this.vehicleLabel = this.vehicleLabels[user?.vehicleType ?? 'sedan'] ?? 'Sedán 🚗';
      this.cdr.detectChanges();
    });
  }

  hasError(f: string): boolean {
    const c = this.form?.get(f);
    return !!(c?.invalid && c?.touched);
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.auth.updateUser(this.form.value);
      this.loading = false;
      this.toastMsg = '✅ Cambios guardados';
      this.logger.info('EditProfile.saved');
      this.cdr.detectChanges();
      setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 3000);
    }, 600);
  }

  onLogout(): void { this.auth.logout(); this.router.navigate(['/auth/splash']); }
  showToast(): void { this.toastMsg = '📷 Función disponible próximamente'; this.cdr.detectChanges(); setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 2500); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, PillButtonComponent],
  template: `
    <div class="verify">
      <div class="verify__logo-wrap">
        <img src="assets/logo-white.svg" alt="SafeRoutes Guardian" class="verify__logo"/>
      </div>

      <div class="verify__card">
        <div class="verify__icon">🔐</div>
        <h1 class="verify__title">Verificar cuenta</h1>
        <p class="verify__subtitle">Selecciona cómo quieres recibir tu código de verificación</p>

        <div class="verify__options">
          <button class="verify__option" [class.verify__option--selected]="method === 'phone'" (click)="method = 'phone'">
            <span class="verify__opt-icon">📱</span>
            <div>
              <div class="verify__opt-name">Número de teléfono</div>
              <div class="verify__opt-desc">Código SMS a tu celular</div>
            </div>
            <span class="verify__opt-check" *ngIf="method === 'phone'">✓</span>
          </button>

          <button class="verify__option" [class.verify__option--selected]="method === 'email'" (click)="method = 'email'">
            <span class="verify__opt-icon">📧</span>
            <div>
              <div class="verify__opt-name">Correo electrónico</div>
              <div class="verify__opt-desc">Código enviado a tu email</div>
            </div>
            <span class="verify__opt-check" *ngIf="method === 'email'">✓</span>
          </button>
        </div>

        <app-pill-button variant="primary" [block]="true" (click)="onContinue()">
          Continuar →
        </app-pill-button>

        <p class="verify__skip" (click)="onSkip()">Omitir por ahora</p>
      </div>
    </div>
  `,
  styleUrl: './verify-account.component.scss',
})
export class VerifyAccountComponent {
  method: 'phone' | 'email' = 'phone';
  constructor(private router: Router, private logger: LoggerService) {}
  onContinue(): void {
    this.logger.info('VerifyAccount.continue', { method: this.method });
    this.router.navigate(['/auth/otp']);
  }
  onSkip(): void { this.router.navigate(['/auth/vehicle-selection']); }
}

import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { AuthService } from '../../shared/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, PillButtonComponent, HeaderBarComponent],
  template: `
    <div class="otp">
      <app-header-bar title="Verificación OTP"></app-header-bar>
      <div class="otp__body">
        <div class="otp__modal">
          <div class="otp__shield">🔐</div>
          <h2 class="otp__title">Ingresa el código</h2>
          <p class="otp__subtitle">Enviamos un código de 4 dígitos a tu correo / teléfono</p>
          <div class="otp__inputs">
            @for (d of digits; track $index) {
              <input
                #otpInput type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                class="otp__digit"
                [class.otp__digit--error]="errorMsg"
                [class.otp__digit--filled]="digits[$index]"
                (input)="onDigitInput($event, $index)"
                (keydown)="onKeyDown($event, $index)"
                (paste)="onPaste($event)"
              />
            }
          </div>
          <p class="otp__error" *ngIf="errorMsg">{{ errorMsg }}</p>
          <app-pill-button variant="primary" [block]="true" [disabled]="loading" (click)="onConfirm()">
            {{ loading ? 'Verificando...' : 'Confirmar' }}
          </app-pill-button>
          <p class="otp__resend">¿No recibiste el código? <span (click)="onResend()">Reenviar</span></p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './otp.component.scss',
})
export class OtpComponent implements AfterViewInit {
  digits: string[] = ['', '', '', ''];
  loading = false;
  errorMsg = '';

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngAfterViewInit(): void {
    const first = this.inputs.first;
    if (first) first.nativeElement.focus();
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(0, 1);
    input.value = val;
    this.digits[index] = val;
    this.errorMsg = '';
    if (val && index < 3) this.inputs.toArray()[index + 1].nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.digits[index] && index > 0) {
        this.digits[index - 1] = '';
        const prev = this.inputs.toArray()[index - 1].nativeElement;
        prev.value = ''; prev.focus();
      } else {
        this.digits[index] = '';
        (event.target as HTMLInputElement).value = '';
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 4);
    const arr = this.inputs.toArray();
    for (let i = 0; i < 4; i++) {
      this.digits[i] = pasted[i] ?? '';
      arr[i].nativeElement.value = this.digits[i];
    }
    arr[Math.min(pasted.length, 3)].nativeElement.focus();
    this.errorMsg = '';
  }

  onResend(): void {
    this.digits = ['', '', '', ''];
    this.inputs.toArray().forEach(i => { i.nativeElement.value = ''; });
    this.errorMsg = '';
    this.inputs.first?.nativeElement.focus();
    this.logger.info('OTP.resend');
  }

  onConfirm(): void {
    const code = this.digits.join('');
    if (code.length < 4) { this.errorMsg = 'Ingresa los 4 dígitos'; return; }
    this.loading = true;
    this.auth.verifyOtp(code).subscribe({
      next: (valid) => {
        this.loading = false;
        if (valid) { this.logger.info('OTP.verified'); this.router.navigate(['/auth/vehicle-selection']); }
        else { this.errorMsg = 'Código incorrecto. Intenta de nuevo.'; this.logger.warn('OTP.invalid'); }
      },
      error: (err) => { this.loading = false; this.errorMsg = 'Error al verificar. Intenta de nuevo.'; this.logger.error('OTP.error', err); },
    });
  }
}

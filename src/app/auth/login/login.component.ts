import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.logger.warn('LoginComponent.submit.invalid');
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;
    this.errorMsg = '';
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/auth/vehicle-selection']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.message ?? 'Error al iniciar sesión.';
        this.cdr.detectChanges();
        this.logger.error('LoginComponent.submit.error', err);
      },
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  loginGoogle(): void {
    this.loading = true;
    this.errorMsg = '';
    this.auth.loginWithGoogle().subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/auth/vehicle-selection']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.message ?? 'Error al iniciar con Google.';
        this.cdr.detectChanges();
      },
    });
  }
}

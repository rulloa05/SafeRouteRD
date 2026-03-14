import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public router: Router,
    private logger: LoggerService,
  ) {
    this.form = this.fb.group({
      fullName:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone:           [''],
      dateOfBirth:     [''],
      stateCity:       [''],
    });
  }

  onSubmit(): void {
    this.errorMsg = '';

    // Marcar todos para mostrar errores inline
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMsg = 'Por favor completa los campos requeridos.';
      return;
    }

    const v = this.form.value;
    if (v.password !== v.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.auth.register({ ...v }).subscribe({
      next: () => {
        this.loading = false;
        this.logger.info('SignUp.success');
        // Después de registrar → selección de vehículo
        this.router.navigate(['/auth/vehicle-selection']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Error al crear la cuenta. Intenta de nuevo.';
        this.logger.error('SignUp.error', err);
      },
    });
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}

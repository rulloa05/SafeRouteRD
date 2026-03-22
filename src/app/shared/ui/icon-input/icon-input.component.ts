import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-icon-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="icon-input" [class.icon-input--error]="showError">
      <span class="icon-input__icon" *ngIf="icon">
        <i [class]="'bi bi-' + icon"></i>
      </span>
      <input
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <button
        *ngIf="clearable && value"
        type="button"
        class="icon-input__clear"
        (click)="clear()"
        aria-label="Clear">
        <i class="bi bi-x"></i>
      </button>
    </div>
    <span class="icon-input__error" *ngIf="showError && errorMessage">
      {{ errorMessage }}
    </span>
  `,
  styleUrl: './icon-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconInputComponent),
      multi: true,
    },
  ],
})
export class IconInputComponent implements ControlValueAccessor {
  @Input() icon = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'number' = 'text';
  @Input() clearable = false;
  @Input() showError = false;
  @Input() errorMessage = '';

  value = '';
  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  clear(): void {
    this.value = '';
    this.onChange('');
  }
}

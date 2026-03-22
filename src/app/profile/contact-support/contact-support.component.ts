import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { PillButtonComponent } from '../../shared/ui/pill-button/pill-button.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-contact-support',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBarComponent, PillButtonComponent, BottomNavComponent],
  template: `
    <div class="support">
      <app-header-bar title="Contactar Soporte"></app-header-bar>

      <div class="support__body">
        <!-- FAQ quick links -->
        <div class="support__section-label">Preguntas frecuentes</div>
        <div class="support__faq-item" *ngFor="let faq of faqs" (click)="faq.open = !faq.open">
          <div class="support__faq-q">
            <span>{{ faq.q }}</span>
            <span class="support__faq-arrow" [class.support__faq-arrow--open]="faq.open">›</span>
          </div>
          <div class="support__faq-a" *ngIf="faq.open">{{ faq.a }}</div>
        </div>

        <!-- Contact form -->
        <div class="support__section-label" style="margin-top:20px">Enviar mensaje</div>
        <div class="support__card" *ngIf="!sent">
          <div class="support__field">
            <label>Categoría</label>
            <select [(ngModel)]="category" class="support__select">
              <option value="">Selecciona una categoría</option>
              <option value="bug">Error en la app</option>
              <option value="route">Problema con una ruta</option>
              <option value="account">Problema con mi cuenta</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div class="support__field">
            <label>Mensaje</label>
            <textarea [(ngModel)]="message" placeholder="Describe tu problema..." class="support__textarea" rows="4"></textarea>
          </div>
          <app-pill-button variant="primary" [block]="true" [disabled]="!message || !category" (click)="onSend()">
            Enviar mensaje
          </app-pill-button>
        </div>

        <div class="support__sent" *ngIf="sent">
          <span style="font-size:48px">✅</span>
          <h3>¡Mensaje enviado!</h3>
          <p>Te responderemos en menos de 24 horas a tu correo registrado.</p>
          <button class="support__new-btn" (click)="sent=false;message='';category=''">Enviar otro mensaje</button>
        </div>

        <!-- Contact info -->
        <div class="support__contact-row">
          <span>📧</span><span>soporte@saferoutes.do</span>
        </div>
        <div class="support__contact-row">
          <span>📱</span><span>+1 (809) 555-0199</span>
        </div>
      </div>

      <app-bottom-nav active="profile"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .support { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .support__body { padding: 14px 16px; }
    .support__section-label { font-size: 11px; font-weight: $font-weight-bold; color: $color-gray-500; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px; }
    .support__faq-item { background: $color-white; border-radius: $radius-md; padding: 14px; margin-bottom: 6px; cursor: pointer; box-shadow: $shadow-card; }
    .support__faq-q { display: flex; justify-content: space-between; align-items: center; font-size: $font-size-sm; font-weight: $font-weight-semibold; color: $color-gray-800; }
    .support__faq-arrow { font-size: 20px; color: $color-gray-400; transition: transform .2s; &--open { transform: rotate(90deg); } }
    .support__faq-a { margin-top: 10px; font-size: $font-size-sm; color: $color-gray-600; line-height: 1.55; border-top: 1px solid $color-gray-100; padding-top: 10px; }
    .support__card { background: $color-white; border-radius: $radius-md; padding: 16px; box-shadow: $shadow-card; display: flex; flex-direction: column; gap: 14px; }
    .support__field { display: flex; flex-direction: column; gap: 5px; label { font-size: 12px; font-weight: $font-weight-bold; color: $color-gray-600; text-transform: uppercase; letter-spacing: .4px; } }
    .support__select { padding: 12px 14px; border: 1.5px solid $color-gray-300; border-radius: $radius-md; font-size: $font-size-sm; color: $color-gray-800; outline: none; &:focus { border-color: $color-primary; } }
    .support__textarea { padding: 12px 14px; border: 1.5px solid $color-gray-300; border-radius: $radius-md; font-size: $font-size-sm; color: $color-gray-800; font-family: inherit; resize: none; outline: none; &:focus { border-color: $color-primary; } }
    .support__sent { display: flex; flex-direction: column; align-items: center; background: $color-white; border-radius: $radius-md; padding: 28px 16px; gap: 10px; text-align: center; box-shadow: $shadow-card; h3 { font-size: $font-size-lg; font-weight: $font-weight-bold; color: $color-gray-800; } p { font-size: $font-size-sm; color: $color-gray-600; } }
    .support__new-btn { margin-top: 4px; padding: 10px 24px; background: rgba($color-primary,.1); color: $color-primary; border: none; border-radius: $radius-pill; font-weight: $font-weight-semibold; cursor: pointer; }
    .support__contact-row { display: flex; align-items: center; gap: 10px; font-size: $font-size-sm; color: $color-gray-600; padding: 10px 4px; }
  `],
})
export class ContactSupportComponent {
  message = '';
  category = '';
  sent = false;

  constructor(private cdr: ChangeDetectorRef) {}

  faqs = [
    { q: '¿Cómo cambio mi tipo de vehículo?', a: 'Ve a Configuración → Cambiar vehículo, o desde tu perfil.', open: false },
    { q: '¿Cómo reporto un bache?', a: 'En el mapa, mantén presionado el punto donde está el bache y selecciona "Reportar incidente".', open: false },
    { q: '¿Por qué la app me redirige por una ruta más larga?', a: 'La app prioriza la seguridad de tu vehículo. La ruta más corta puede tener condiciones incompatibles con tu vehículo.', open: false },
    { q: '¿Funciona sin internet?', a: 'Se requiere conexión para cargar el mapa y calcular rutas en tiempo real.', open: false },
  ];

  onSend(): void {
    if (!this.message || !this.category) return;
    setTimeout(() => { this.sent = true; this.cdr.detectChanges(); }, 400);
  }
}

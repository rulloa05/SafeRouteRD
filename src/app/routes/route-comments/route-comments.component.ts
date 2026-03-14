import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderBarComponent } from '../../shared/ui/header-bar/header-bar.component';
import { BottomNavComponent } from '../../shared/ui/bottom-nav/bottom-nav.component';
import { RouteService } from '../../shared/services/route.service';
import { RouteComment } from '../../shared/models';

const VEHICLE_ICONS: Record<string, string> = { sedan: '🚗', suv: '🚙', moto: '🏍️', pickup: '🚚' };

@Component({
  selector: 'app-route-comments',
  standalone: true,
  imports: [CommonModule, HeaderBarComponent, BottomNavComponent],
  template: `
    <div class="rcomments">
      <app-header-bar title="Opiniones de Usuarios"></app-header-bar>

      <div class="rcomments__summary" *ngIf="!loading">
        <div class="rcomments__avg">{{ avgRating.toFixed(1) }}</div>
        <div>
          <div class="rcomments__stars">
            <span *ngFor="let s of [1,2,3,4,5]" [class.star--on]="s <= avgRating">★</span>
          </div>
          <div class="rcomments__count">{{ comments.length }} reseñas</div>
        </div>
      </div>

      <div class="rcomments__list">
        <div *ngIf="loading" style="display:flex;justify-content:center;padding:40px">
          <div class="rcomments__spinner"></div>
        </div>
        <div class="rcomments__card" *ngFor="let c of comments">
          <div class="rcomments__card-top">
            <div class="rcomments__avatar">{{ c.userName[0] }}</div>
            <div class="rcomments__user-info">
              <div class="rcomments__user-name">{{ c.userName }}</div>
              <div class="rcomments__vehicle">
                {{ vehicleIcon(c.vehicleType) }} {{ c.vehicleName }} ({{ c.vehicleYear }})
              </div>
            </div>
            <div class="rcomments__rating">
              <span *ngFor="let s of [1,2,3,4,5]" [class.star--on]="s <= c.rating">★</span>
            </div>
          </div>
          <div class="rcomments__route-tag">📍 {{ c.routeName }}</div>
          <p class="rcomments__text">{{ c.comment }}</p>
          <div class="rcomments__date">{{ c.createdAt | date:'mediumDate' }}</div>
        </div>
      </div>

      <app-bottom-nav active="bookings"></app-bottom-nav>
    </div>
  `,
  styles: [`
    @use 'variables' as *;
    .rcomments { min-height: 100dvh; background: $color-gray-50; padding-bottom: 80px; }
    .rcomments__summary { background: $color-white; padding: 16px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid $color-gray-200; }
    .rcomments__avg { font-size: 48px; font-weight: $font-weight-bold; color: $color-primary; line-height: 1; }
    .rcomments__stars { font-size: 20px; color: $color-gray-300; .star--on { color: $color-accent-gold; } }
    .rcomments__count { font-size: $font-size-xs; color: $color-gray-500; margin-top: 4px; }
    .rcomments__list { padding: 12px 16px; }
    .rcomments__card { background: $color-white; border-radius: $radius-md; padding: 14px; margin-bottom: 10px; box-shadow: $shadow-card; }
    .rcomments__card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .rcomments__avatar { width: 38px; height: 38px; background: $color-primary; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: $color-white; font-weight: $font-weight-bold; font-size: $font-size-md; flex-shrink: 0; }
    .rcomments__user-info { flex: 1; }
    .rcomments__user-name { font-size: $font-size-sm; font-weight: $font-weight-bold; color: $color-gray-800; }
    .rcomments__vehicle { font-size: $font-size-xs; color: $color-gray-500; margin-top: 2px; }
    .rcomments__rating { font-size: 14px; color: $color-gray-300; .star--on { color: $color-accent-gold; } }
    .rcomments__route-tag { font-size: 11px; font-weight: $font-weight-semibold; color: $color-primary; background: rgba($color-primary,.1); display: inline-block; padding: 3px 10px; border-radius: 20px; margin-bottom: 8px; }
    .rcomments__text { font-size: $font-size-sm; color: $color-gray-700; line-height: 1.55; }
    .rcomments__date { font-size: $font-size-xs; color: $color-gray-400; margin-top: 8px; }
    .rcomments__spinner { width: 36px; height: 36px; border: 3px solid $color-gray-200; border-top-color: $color-primary; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .star--on { color: $color-accent-gold !important; }
  `],
})
export class RouteCommentsComponent implements OnInit {
  comments: RouteComment[] = [];
  loading = true;
  get avgRating() { return this.comments.length ? this.comments.reduce((s, c) => s + c.rating, 0) / this.comments.length : 0; }
  vehicleIcon(t: string) { return VEHICLE_ICONS[t] ?? '🚗'; }
  constructor(private routeService: RouteService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.routeService.getComments().subscribe(c => { this.comments = c; this.loading = false; this.cdr.detectChanges(); }); }
}

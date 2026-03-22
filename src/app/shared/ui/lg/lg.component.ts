import {
  Component, Input, HostListener, ViewEncapsulation, ChangeDetectionStrategy,
} from '@angular/core';

/**
 * LiquidGlass wrapper component.
 *
 * Usage:
 *   <app-lg [radius]="20" [padding]="16">
 *     ... content ...
 *   </app-lg>
 *
 * Inputs:
 *   radius   – border-radius in px (default 20)
 *   padding  – inner padding in px (default 20)
 *   dark     – darker frost tint (for map overlays on light bg)
 *   teal     – teal tinted glass
 *   displace – SVG turbulence scale (0 = off, default 8)
 */
@Component({
  selector: 'app-lg',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Inline SVG filter — turbulence displacement for liquid edges -->
    <svg class="lg__defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter [attr.id]="fid" x="-8%" y="-8%" width="116%" height="116%"
                color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise"
            [attr.baseFrequency]="baseFreq"
            numOctaves="4"
            [attr.seed]="seed"
            result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise"
            [attr.scale]="displace"
            xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>

    <!-- Frost layer: gets the SVG liquid warp applied -->
    <div class="lg__frost"
         [class.lg__frost--dark]="dark"
         [class.lg__frost--teal]="teal"
         [style.border-radius.px]="radius"
         [style.filter]="filterRef">
    </div>

    <!-- Content — no filter applied, stays crisp -->
    <div class="lg__inner" [style.padding.px]="padding">
      <ng-content></ng-content>
    </div>

    <!-- Edge highlight (specular border, rotates with mouse) -->
    <div class="lg__edge"
         [style.border-radius.px]="radius"
         [style.background]="specularGrad">
    </div>
  `,
  styles: [`
    app-lg {
      display: block;
      position: relative;
    }

    .lg__defs {
      position: absolute;
      width: 0; height: 0;
      overflow: hidden;
      pointer-events: none;
    }

    /* Frosted backdrop layer — SVG warp lives here */
    .lg__frost {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(28px) saturate(185%);
      -webkit-backdrop-filter: blur(28px) saturate(185%);
      background: rgba(255, 255, 255, 0.08);
      pointer-events: none;

      &--dark {
        background: rgba(6, 10, 25, 0.65);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
      }

      &--teal {
        background: rgba(13, 115, 119, 0.22);
        backdrop-filter: blur(24px) saturate(165%);
        -webkit-backdrop-filter: blur(24px) saturate(165%);
        border: 1px solid rgba(13, 185, 150, 0.3);
      }
    }

    /* Content sits above the frost */
    .lg__inner {
      position: relative;
      z-index: 2;
    }

    /* Specular border — inset highlight + outer shadow */
    .lg__edge {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 3;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.32),
        inset 0 -1px 0 rgba(255, 255, 255, 0.05),
        0 8px 40px rgba(0, 0, 0, 0.38),
        0 2px 8px rgba(0, 0, 0, 0.2);
    }
  `],
})
export class LgComponent {
  @Input() radius   = 20;
  @Input() padding  = 20;
  @Input() displace = 8;
  @Input() baseFreq = '0.75 0.75';
  @Input() dark     = false;
  @Input() teal     = false;

  readonly uid = Math.random().toString(36).slice(2, 7);
  readonly seed = Math.floor(Math.random() * 60) + 1;

  get fid(): string { return `lg-${this.uid}`; }
  get filterRef(): string { return `url(#${this.fid})`; }

  /** Specular highlight gradient angle tracks mouse position */
  specularGrad =
    'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)';

  @HostListener('mousemove', ['$event'])
  onMouse(e: MouseEvent): void {
    const el   = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    const deg  = Math.round(Math.atan2(y - 50, x - 50) * (180 / Math.PI)) + 90;
    this.specularGrad =
      `linear-gradient(${deg}deg, rgba(255,255,255,0.18) 0%, transparent 55%)`;
  }
}

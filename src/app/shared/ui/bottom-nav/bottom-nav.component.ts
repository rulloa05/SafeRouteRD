import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsService } from '../../services/icons.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  @Input() active: 'map' | 'search' | 'destination' | 'routes' | 'bookings' | 'profile' = 'map';
  constructor(public router: Router, public icons: IconsService) {}
  nav(path: string): void { this.router.navigate([path]); }
}

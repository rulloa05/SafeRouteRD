import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  private interval?: ReturnType<typeof setInterval>;

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {
    this.logger.info('SplashComponent.init');
    // Sólo anima los dots, NO redirige automáticamente
    this.interval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}

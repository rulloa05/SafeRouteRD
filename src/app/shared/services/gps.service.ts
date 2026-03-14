import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const DEFAULT_POS: GpsPosition = {
  lat: 18.4861, lng: -69.9312, accuracy: 0, timestamp: Date.now(),
};

@Injectable({ providedIn: 'root' })
export class GpsService {
  private position$ = new BehaviorSubject<GpsPosition>(DEFAULT_POS);
  private watchId?: number;
  private hasRealGps = false;

  get position(): Observable<GpsPosition> { return this.position$.asObservable(); }
  get currentPosition(): GpsPosition { return this.position$.value; }
  get isReal(): boolean { return this.hasRealGps; }

  constructor(private zone: NgZone) {}

  /** One-shot: get current position */
  requestOnce(): Promise<GpsPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { resolve(DEFAULT_POS); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = this.toGpsPosition(pos);
          this.zone.run(() => {
            this.hasRealGps = true;
            this.position$.next(p);
          });
          resolve(p);
        },
        (err) => {
          console.warn('GPS error:', err.message);
          resolve(DEFAULT_POS);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  }

  /** Continuous watch — call stopWatch() when done */
  startWatch(): void {
    if (!navigator.geolocation || this.watchId !== undefined) return;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = this.toGpsPosition(pos);
        this.zone.run(() => {
          this.hasRealGps = true;
          this.position$.next(p);
        });
      },
      (err) => console.warn('GPS watch error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  stopWatch(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }

  private toGpsPosition(pos: GeolocationPosition): GpsPosition {
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
  }
}

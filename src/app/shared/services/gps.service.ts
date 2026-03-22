import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export type GpsError = 'denied' | 'unavailable' | 'timeout' | 'none';

const DEFAULT_POS: GpsPosition = {
  lat: 18.4861, lng: -69.9312, accuracy: 0, timestamp: Date.now(),
};

@Injectable({ providedIn: 'root' })
export class GpsService {
  private position$ = new BehaviorSubject<GpsPosition>(DEFAULT_POS);
  private lastError$ = new BehaviorSubject<GpsError>('none');
  private watchId?: number;
  private hasRealGps = false;

  get position(): Observable<GpsPosition> { return this.position$.asObservable(); }
  get currentPosition(): GpsPosition { return this.position$.value; }
  get isReal(): boolean { return this.hasRealGps; }
  get lastError(): GpsError { return this.lastError$.value; }

  constructor(private zone: NgZone) {}

  /** One-shot: get current position. Returns real pos or DEFAULT_POS on error. */
  requestOnce(): Promise<{ pos: GpsPosition; error: GpsError }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.lastError$.next('unavailable');
        resolve({ pos: DEFAULT_POS, error: 'unavailable' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (raw) => {
          const pos = this.toGpsPosition(raw);
          this.zone.run(() => {
            this.hasRealGps = true;
            this.lastError$.next('none');
            this.position$.next(pos);
          });
          resolve({ pos, error: 'none' });
        },
        (err) => {
          let error: GpsError = 'unavailable';
          if (err.code === err.PERMISSION_DENIED) error = 'denied';
          else if (err.code === err.TIMEOUT) error = 'timeout';
          console.warn('GPS error:', err.message);
          this.zone.run(() => this.lastError$.next(error));
          resolve({ pos: DEFAULT_POS, error });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  }

  /** Continuous watch — call stopWatch() when done */
  startWatch(): void {
    if (!navigator.geolocation || this.watchId !== undefined) return;
    this.watchId = navigator.geolocation.watchPosition(
      (raw) => {
        const pos = this.toGpsPosition(raw);
        this.zone.run(() => {
          this.hasRealGps = true;
          this.lastError$.next('none');
          this.position$.next(pos);
        });
      },
      (err) => {
        let error: GpsError = 'unavailable';
        if (err.code === err.PERMISSION_DENIED) error = 'denied';
        this.zone.run(() => this.lastError$.next(error));
        console.warn('GPS watch error:', err.message);
      },
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

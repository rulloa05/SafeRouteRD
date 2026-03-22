import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(action: string, data?: unknown): void {
    const message = data !== undefined && data !== null ? data : '[no data]';
    console.log(`[SafeRoutes][INFO] ${action}`, message);
  }

  warn(action: string, data?: unknown): void {
    const message = data !== undefined && data !== null ? data : '[no data]';
    console.warn(`[SafeRoutes][WARN] ${action}`, message);
  }

  error(action: string, data?: unknown): void {
    const message = data !== undefined && data !== null ? data : '[no data]';
    console.error(`[SafeRoutes][ERROR] ${action}`, message);
  }
}

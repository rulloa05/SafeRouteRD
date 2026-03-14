import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';
import { User } from '../models';
import { LoggerService } from './logger.service';

const STORAGE_KEY = 'sr_current_user';
const TOKEN_KEY = 'sr_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(this.loadUser());

  constructor(private logger: LoggerService) {}

  get user$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, _password: string): Observable<User> {
    this.logger.info('AuthService.login', { email });
    const mockUser: User = {
      id: '1',
      fullName: 'Demo User',
      email,
      phone: '809-555-0100',
      dateOfBirth: '1995-06-15',
      stateCity: 'Santo Domingo',
      vehicleType: null,
    };
    return of(mockUser).pipe(
      delay(800),
      tap((user) => {
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
        this.logger.info('AuthService.login.success', { userId: user.id });
      })
    );
  }

  register(data: Partial<User> & { password: string }): Observable<User> {
    this.logger.info('AuthService.register', { email: data.email });
    const newUser: User = {
      id: Date.now().toString(),
      fullName: data.fullName ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
      stateCity: data.stateCity ?? '',
      vehicleType: null,
    };
    return of(newUser).pipe(
      delay(800),
      tap((user) => {
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
        this.logger.info('AuthService.register.success', { userId: user.id });
      })
    );
  }

  forgotPassword(emailOrPhone: string): Observable<boolean> {
    this.logger.info('AuthService.forgotPassword', { emailOrPhone });
    return of(true).pipe(delay(600));
  }

  verifyOtp(code: string): Observable<boolean> {
    this.logger.info('AuthService.verifyOtp', { code });
    return of(code.length === 4).pipe(delay(500));
  }

  logout(): void {
    this.logger.info('AuthService.logout');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser$.next(null);
  }

  updateUser(patch: Partial<User>): void {
    const current = this.currentUser$.value;
    if (current) {
      const updated = { ...current, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      this.currentUser$.next(updated);
      this.logger.info('AuthService.updateUser', patch);
    }
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

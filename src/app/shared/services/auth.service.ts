import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { User } from '../models';
import { LoggerService } from './logger.service';
import { firebaseConfig } from '../../firebase.config';
import { Capacitor } from '@capacitor/core';

// Firebase SDK (tree-shaken)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth, Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  User as FbUser,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore, Firestore,
  doc, setDoc, getDoc,
} from 'firebase/firestore';


const STORAGE_KEY = 'sr_current_user';
const TOKEN_KEY   = 'sr_token';

/** true → usar mock localStorage; false → Firebase real */
const IS_MOCK = firebaseConfig.apiKey === 'TU_API_KEY';

let fbApp:  FirebaseApp | null = null;
let fbAuth: Auth | null        = null;
let fbDb:   Firestore | null   = null;

if (!IS_MOCK) {
  fbApp  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  fbAuth = getAuth(fbApp);
  fbDb   = getFirestore(fbApp);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(this.loadUser());

  get user$(): Observable<User | null> { return this.currentUser$.asObservable(); }
  get isLoggedIn(): boolean { return !!localStorage.getItem(TOKEN_KEY); }

  constructor(private logger: LoggerService) {
    // onAuthStateChanged omitido intencionalmente — getIdToken() cuelga en WKWebView.
    // El estado de sesión se maneja via localStorage (TOKEN_KEY / STORAGE_KEY).
  }

  // ── Login (REST API — evita cuelgues del SDK en WKWebView) ───────────
  login(email: string, password: string): Observable<User> {
    if (IS_MOCK) return this.mockLogin(email);

    return from(this._emailSignIn(email, password)).pipe(
      catchError(err => throwError(() => new Error(this.translateFirebaseError(err.code ?? err.message ?? 'unknown'))))
    );
  }

  private async _emailSignIn(email: string, password: string): Promise<User> {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await resp.json();
    if (data.error) throw { code: data.error.message ?? 'auth/unknown' };

    const uid      = data.localId as string;
    const fbToken  = data.idToken as string;
    const user: User = {
      id: uid,
      fullName: (data.displayName as string) || email.split('@')[0],
      email,
      phone: '', dateOfBirth: '', stateCity: '', vehicleType: null,
    };
    localStorage.setItem(TOKEN_KEY, fbToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser$.next(user);
    // sync Firestore en background
    this.fetchFromFirestore(uid, email)
      .then(u => { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); this.currentUser$.next(u); })
      .catch(() => {});
    this.logger.info('AuthService.login.success', { uid });
    return user;
  }

  // ── Register (REST API — evita cuelgues del SDK en WKWebView) ────────
  register(data: Partial<User> & { password: string }): Observable<User> {
    if (IS_MOCK) return this.mockRegister(data);

    return from(this._emailRegister(data)).pipe(
      catchError(err => throwError(() => new Error(this.translateFirebaseError(err.code ?? err.message ?? 'unknown'))))
    );
  }

  private async _emailRegister(data: Partial<User> & { password: string }): Promise<User> {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email ?? '', password: data.password, returnSecureToken: true }),
      }
    );
    const result = await resp.json();
    if (result.error) throw { code: result.error.message ?? 'auth/unknown' };

    const uid     = result.localId as string;
    const fbToken = result.idToken as string;
    const user: User = {
      id: uid,
      fullName:    data.fullName    ?? '',
      email:       data.email       ?? '',
      phone:       data.phone       ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
      stateCity:   data.stateCity   ?? '',
      vehicleType: null,
    };
    localStorage.setItem(TOKEN_KEY, fbToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser$.next(user);
    // Guardar perfil en Firestore en background
    if (fbDb) setDoc(doc(fbDb, 'users', uid), user).catch(() => {});
    this.logger.info('AuthService.register.success', { uid });
    return user;
  }

  // ── Forgot password ──────────────────────────────────────────────────
  forgotPassword(email: string): Observable<boolean> {
    if (IS_MOCK) return of(true).pipe(delay(600));

    return from(
      sendPasswordResetEmail(fbAuth!, email).then(() => true)
    ).pipe(
      catchError(err => throwError(() => new Error(this.translateFirebaseError(err.code))))
    );
  }

  // ── Google Sign-In ───────────────────────────────────────────────────
  loginWithGoogle(): Observable<User> {
    if (IS_MOCK) return this.mockLogin('google@demo.com');

    return from(this._googleSignIn()).pipe(
      catchError(err => throwError(() => new Error(this.translateFirebaseError(err.code ?? 'unknown'))))
    );
  }

  private async _googleSignIn(): Promise<User> {
    if (Capacitor.isNativePlatform()) {
      // iOS nativo: plugin obtiene credential Google, REST API hace sign-in Firebase
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
      const idToken = result.credential?.idToken;
      if (!idToken) throw { code: 'auth/no-id-token' };

      // Usar REST API directamente — evita el cuelgue del SDK JS en WebView nativo
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postBody: `id_token=${idToken}&providerId=google.com`,
            requestUri: 'http://localhost',
            returnIdpCredential: true,
            returnSecureToken: true,
          }),
        }
      );
      if (!resp.ok) throw { code: 'auth/network-request-failed' };
      const data = await resp.json();
      if (data.error) throw { code: data.error.message ?? 'auth/unknown' };

      const uid   = data.localId as string;
      const email = data.email as string;
      const fbToken = data.idToken as string;

      const user: User = {
        id:          uid,
        fullName:    (data.displayName as string) ?? email.split('@')[0],
        email,
        phone:       '',
        dateOfBirth: '',
        stateCity:   '',
        vehicleType: null,
      };
      localStorage.setItem(TOKEN_KEY, fbToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.currentUser$.next(user);
      // sync Firestore en background
      if (fbDb) {
        getDoc(doc(fbDb, 'users', uid)).then(snap => {
          const u = snap.exists() ? snap.data() as User : user;
          setDoc(doc(fbDb!, 'users', uid), u, { merge: true }).catch(() => {});
          localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          this.currentUser$.next(u);
        }).catch(() => {});
      }
      return user;
    } else {
      // Web → popup normal
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(fbAuth!, provider);
      const fbUser = cred.user;
      const user = await this.fetchFromFirestore(fbUser.uid, fbUser.email ?? '');
      const token = await fbUser.getIdToken();
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.currentUser$.next(user);
      return user;
    }
  }

  private buildUserFromFb(fbUser: FbUser): User {
    return {
      id:          fbUser.uid,
      fullName:    fbUser.displayName ?? fbUser.email?.split('@')[0] ?? '',
      email:       fbUser.email ?? '',
      phone:       '',
      dateOfBirth: '',
      stateCity:   '',
      vehicleType: null,
    };
  }

  // ── Logout ───────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser$.next(null);
    if (!IS_MOCK && fbAuth) signOut(fbAuth).catch(() => {});
    this.logger.info('AuthService.logout');
  }

  // ── Update user ──────────────────────────────────────────────────────
  updateUser(patch: Partial<User>): void {
    const current = this.currentUser$.value;
    if (!current) return;
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.currentUser$.next(updated);
    if (!IS_MOCK && fbDb) {
      setDoc(doc(fbDb, 'users', current.id), updated, { merge: true }).catch(() => {});
    }
    this.logger.info('AuthService.updateUser', patch);
  }

  verifyOtp(code: string): Observable<boolean> {
    return of(code.length === 4).pipe(delay(500));
  }

  // ── Private helpers ──────────────────────────────────────────────────
  private async fetchFromFirestore(uid: string, email: string): Promise<User> {
    try {
      const snap = await getDoc(doc(fbDb!, 'users', uid));
      if (snap.exists()) return snap.data() as User;
    } catch { /* fallthrough */ }
    // No existe el documento → crear perfil mínimo
    const user: User = {
      id: uid, fullName: email.split('@')[0],
      email, phone: '', dateOfBirth: '', stateCity: '', vehicleType: null,
    };
    await setDoc(doc(fbDb!, 'users', uid), user).catch(() => {});
    return user;
  }

  private mockLogin(email: string): Observable<User> {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: User | null = stored ? JSON.parse(stored) : null;
    const derivedName = existing?.fullName && existing.fullName !== 'Demo User'
      ? existing.fullName
      : email.split('@')[0];
    const mockUser: User = {
      id: existing?.id ?? '1',
      fullName: derivedName,
      email,
      phone:       existing?.phone       ?? '809-555-0100',
      dateOfBirth: existing?.dateOfBirth ?? '1995-06-15',
      stateCity:   existing?.stateCity   ?? 'Santo Domingo',
      vehicleType: existing?.vehicleType ?? null,
    };
    return of(mockUser).pipe(
      delay(800),
      tap((user) => {
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
        this.logger.info('AuthService.mockLogin.success');
      })
    );
  }

  private mockRegister(data: Partial<User> & { password: string }): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      fullName:    data.fullName    ?? '',
      email:       data.email       ?? '',
      phone:       data.phone       ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
      stateCity:   data.stateCity   ?? '',
      vehicleType: null,
    };
    return of(newUser).pipe(
      delay(800),
      tap((user) => {
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
        this.logger.info('AuthService.mockRegister.success');
      })
    );
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private translateFirebaseError(code: string): string {
    const map: Record<string, string> = {
      'auth/user-not-found':      'No existe una cuenta con ese correo.',
      'auth/wrong-password':      'Contraseña incorrecta. Intenta de nuevo.',
      'auth/invalid-email':       'El correo electrónico no es válido.',
      'auth/email-already-in-use':'Ese correo ya está registrado.',
      'auth/weak-password':       'La contraseña debe tener al menos 6 caracteres.',
      'auth/too-many-requests':   'Demasiados intentos. Espera un momento.',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
      'auth/invalid-credential':  'Credenciales incorrectas. Verifica tu correo y contraseña.',
      'auth/user-disabled':       'Esta cuenta ha sido deshabilitada.',
    };
    return map[code] ?? `Error de autenticación (${code}).`;
  }
}

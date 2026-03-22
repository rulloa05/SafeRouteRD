import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { RouteOption, RouteDetail, Booking, RouteComment, GasCalculation, TripHistory, UserIncident } from '../models';

const VEHICLE_KEY   = 'sr_selected_vehicle';
const HISTORY_KEY   = 'sr_trip_history';
const INCIDENTS_KEY = 'sr_user_incidents';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private selectedVehicle$ = new BehaviorSubject<string>(
    localStorage.getItem(VEHICLE_KEY) ?? 'sedan'
  );

  get vehicle$() { return this.selectedVehicle$.asObservable(); }
  get currentVehicle() { return this.selectedVehicle$.value; }

  setVehicle(v: string) {
    localStorage.setItem(VEHICLE_KEY, v);
    this.selectedVehicle$.next(v);
  }

  searchRoutes(origin: string, dest: string, vehicle: string): Observable<RouteOption[]> {
    const routes: RouteOption[] = [
      {
        id: 'r1',
        name: 'Ruta Óptima',
        estimatedMinutes: 14,
        distanceKm: 5.2,
        safetyLevel: 'alto',
        roadCondition: 'bueno',
        vehicleCompatibility: vehicle,
        isRecommended: true,
      },
      {
        id: 'r2',
        name: 'Ruta Alternativa',
        estimatedMinutes: 18,
        distanceKm: 6.8,
        safetyLevel: 'medio',
        roadCondition: 'regular',
        vehicleCompatibility: vehicle,
        isRecommended: false,
      },
      {
        id: 'r3',
        name: 'Ruta Más Corta',
        estimatedMinutes: 11,
        distanceKm: 4.1,
        safetyLevel: 'bajo',
        roadCondition: 'malo',
        vehicleCompatibility: vehicle === 'suv' || vehicle === 'pickup' ? vehicle : 'none',
        isRecommended: false,
      },
    ];
    return of(routes).pipe(delay(600));
  }

  getRouteDetail(id: string): Observable<RouteDetail> {
    const detail: RouteDetail = {
      id,
      name: 'Ruta Óptima — Santo Domingo',
      estimatedMinutes: 14,
      distanceKm: 5.2,
      safetyLevel: 'alto',
      roadCondition: 'bueno',
      vehicleCompatibility: 'sedan',
      isRecommended: true,
      startPoint: 'Tu ubicación actual',
      dropLocation: 'UNAPEC, Av. Máximo Gómez',
      emergencyNumber: '911',
      gasolinePricePerDistance: 12.5,
      alternatives: [
        { name: 'Ruta Alternativa', estimatedMinutes: 18 },
        { name: 'Ruta Más Corta', estimatedMinutes: 11 },
      ],
    };
    return of(detail).pipe(delay(400));
  }

  getBookings(): Observable<Booking[]> {
    return of([
      { id: 'b1', routeName: 'Casa → UNAPEC', date: '2026-01-20', time: '07:45 AM', vehicleName: 'Sedán Toyota', cost: 65, rating: 5, status: 'past' as const },
      { id: 'b2', routeName: 'UNAPEC → Ágora Mall', date: '2026-01-21', time: '02:30 PM', vehicleName: 'Sedán Toyota', cost: 85, rating: 4, status: 'past' as const },
      { id: 'b3', routeName: 'Casa → Aeropuerto', date: '2026-01-25', time: '06:00 AM', vehicleName: 'Sedán Toyota', cost: 180, rating: 0, status: 'current' as const },
      { id: 'b4', routeName: 'Aeropuerto → Casa', date: '2026-01-28', time: '04:00 PM', vehicleName: 'Sedán Toyota', cost: 180, rating: 0, status: 'current' as const },
    ]).pipe(delay(400));
  }

  getComments(): Observable<RouteComment[]> {
    return of([
      { id: 'c1', userName: 'Carlos M.', vehicleType: 'sedan', vehicleName: 'Toyota Corolla 2019', vehicleYear: 2019, rating: 5, comment: 'Excelente ruta, no tuve ningún bache. La app me ahorró ir por la Mella que estaba en mal estado.', routeName: 'Casa → UNAPEC', createdAt: '2026-01-20T10:30:00Z' },
      { id: 'c2', userName: 'Ana R.', vehicleType: 'suv', vehicleName: 'Hyundai Tucson 2022', vehicleYear: 2022, rating: 4, comment: 'Buena ruta para el SUV. Tomó en cuenta que puedo pasar por calles más difíciles. Un poco larga pero sin daños.', routeName: 'Gazcue → Churchill', createdAt: '2026-01-21T09:15:00Z' },
      { id: 'c3', userName: 'Miguelito', vehicleType: 'moto', vehicleName: 'Honda CB190', vehicleYear: 2021, rating: 5, comment: 'La ruta para motocicleta está perfecta, me lleva por las calles más rápidas sin tanto tráfico.', routeName: 'Villa Mella → Centro', createdAt: '2026-01-22T14:00:00Z' },
      { id: 'c4', userName: 'Pedro L.', vehicleType: 'pickup', vehicleName: 'F-150 2020', vehicleYear: 2020, rating: 3, comment: 'Para el pickup fue regular. Hay una zona cerca del puente que necesita más información de la app.', routeName: 'Los Alcarrizos → Zona Industrial', createdAt: '2026-01-23T08:45:00Z' },
      { id: 'c5', userName: 'María F.', vehicleType: 'sedan', vehicleName: 'Honda Civic 2018', vehicleYear: 2018, rating: 5, comment: 'Increíble. Usaba Waze antes y me dañó el amortiguador. Con Safe Routes Guardian no he tenido ningún problema.', routeName: 'Naco → Plaza Central', createdAt: '2026-01-24T11:20:00Z' },
    ]).pipe(delay(500));
  }

  // ── Trip History ────────────────────────────────────────────────
  private loadHistory(): TripHistory[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); } catch { return []; }
  }

  getHistory(): Observable<TripHistory[]> {
    return of(this.loadHistory().reverse()).pipe(delay(200));
  }

  addTrip(trip: Omit<TripHistory, 'id' | 'date'>): void {
    const history = this.loadHistory();
    history.push({ ...trip, id: `t${Date.now()}`, date: new Date().toISOString() });
    // Keep last 50 trips
    if (history.length > 50) history.splice(0, history.length - 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }

  // ── User Incidents ────────────────────────────────────────────────
  private loadIncidents(): UserIncident[] {
    try { return JSON.parse(localStorage.getItem(INCIDENTS_KEY) ?? '[]'); } catch { return []; }
  }

  getUserIncidents(): UserIncident[] { return this.loadIncidents(); }

  addIncident(inc: Omit<UserIncident, 'id' | 'createdAt'>): UserIncident {
    const incidents = this.loadIncidents();
    const newInc: UserIncident = { ...inc, id: `i${Date.now()}`, createdAt: new Date().toISOString() };
    incidents.push(newInc);
    // Keep last 100 incidents
    if (incidents.length > 100) incidents.splice(0, incidents.length - 100);
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    return newInc;
  }

  // ── Gas calculation ────────────────────────────────────────────────
  calculateGas(distance: number, rideMinutes: number, vehicle: string): Observable<GasCalculation> {
    const rates: Record<string, number> = { sedan: 12.5, suv: 18, moto: 6, pickup: 22 };
    const rate = rates[vehicle] ?? 12.5;
    return of({
      totalDistance: distance,
      rideTimeMinutes: rideMinutes,
      totalAmount: parseFloat((distance * rate).toFixed(2)),
      currency: 'RD$',
    }).pipe(delay(300));
  }
}

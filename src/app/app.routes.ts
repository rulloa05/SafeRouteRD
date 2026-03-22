import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/splash', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth/splash',
    loadComponent: () => import('./auth/splash/splash.component').then(m => m.SplashComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/verify-account',
    loadComponent: () => import('./auth/verify-account/verify-account.component').then(m => m.VerifyAccountComponent),
  },
  {
    path: 'auth/otp',
    loadComponent: () => import('./auth/otp/otp.component').then(m => m.OtpComponent),
  },
  {
    path: 'auth/sign-up',
    loadComponent: () => import('./auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: 'auth/vehicle-selection',
    canActivate: [authGuard],
    loadComponent: () => import('./auth/vehicle-selection/vehicle-selection.component').then(m => m.VehicleSelectionComponent),
  },

  // Map (protected)
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () => import('./map/map-home/map-home.component').then(m => m.MapHomeComponent),
  },
  {
    path: 'map/destination',
    canActivate: [authGuard],
    loadComponent: () => import('./map/set-destination/set-destination.component').then(m => m.SetDestinationComponent),
  },
  {
    path: 'map/search',
    canActivate: [authGuard],
    loadComponent: () => import('./map/route-search/route-search.component').then(m => m.RouteSearchComponent),
  },
  {
    path: 'map/detail',
    canActivate: [authGuard],
    loadComponent: () => import('./map/route-detail/route-detail.component').then(m => m.RouteDetailComponent),
  },
  {
    path: 'map/active',
    canActivate: [authGuard],
    loadComponent: () => import('./map/active-route/active-route.component').then(m => m.ActiveRouteComponent),
  },

  // Routes management (protected)
  {
    path: 'routes/schedule',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/schedule-ride/schedule-ride.component').then(m => m.ScheduleRideComponent),
  },
  {
    path: 'routes/bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/bookings/bookings.component').then(m => m.BookingsComponent),
  },
  {
    path: 'routes/comments',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/route-comments/route-comments.component').then(m => m.RouteCommentsComponent),
  },
  {
    path: 'routes/details',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/routes-details/routes-details.component').then(m => m.RoutesDetailsComponent),
  },

  // Calculator (protected)
  {
    path: 'calculator',
    canActivate: [authGuard],
    loadComponent: () => import('./calculator/calculator.component').then(m => m.CalculatorComponent),
  },

  // Profile (protected)
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
  },
  {
    path: 'profile/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'profile/support',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/contact-support/contact-support.component').then(m => m.ContactSupportComponent),
  },

  { path: '**', redirectTo: 'auth/splash' },
];

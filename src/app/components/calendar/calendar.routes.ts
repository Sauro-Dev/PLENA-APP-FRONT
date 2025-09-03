import { Routes } from '@angular/router';
import { authGuard } from '../auth/auth.guard';
import { roleGuard } from '../auth/role-guard.guard';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./calendar/calendar.component').then((m) => m.CalendarComponent),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Calendario', roles: ['secretary', 'therapist', 'admin'] }
  }
] as Routes;

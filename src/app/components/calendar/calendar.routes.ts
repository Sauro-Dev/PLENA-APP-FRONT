import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./calendar/calendar.component').then((m) => m.CalendarComponent),
  },
] as Routes;

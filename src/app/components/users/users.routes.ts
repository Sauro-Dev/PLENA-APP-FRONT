import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component')
    .then((m) => m.RegisterComponent),
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./users-details/users-details.component')
    .then( (m) => m.UsersDetailsComponent),
  },
] as Routes;

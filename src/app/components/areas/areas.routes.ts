import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./areas/areas.component').then((m) => m.AreasComponent),
    data: { breadcrumb: 'Áreas' },
  },
  {
    path: 'areas-register',
    loadComponent: () =>
      import('./areas-register/areas-register.component').then(
        (m) => m.AreasRegisterComponent
      ),
    data: { breadcrumb: 'Registrar Área' },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./area-edit/area-edit.component').then(
        (m) => m.AreaEditComponent
      ),
    data: { breadcrumb: 'Editar Área' },
  },
] as Routes;

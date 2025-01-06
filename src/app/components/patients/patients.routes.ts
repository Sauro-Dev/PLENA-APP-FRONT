import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./patients/patients.component').then((m) => m.PatientsComponent),
    data: { breadcrumb: 'Pacientes' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./patient-register/patient-register.component').then((m) => m.PatientRegisterComponent),
    data: { breadcrumb: 'Registrar Paciente' },
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./patient-details/patient-details.component').then((m) => m.PatientDetailsComponent),
    data: { breadcrumb: 'Detalles de Paciente' },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./patient-edit/patient-edit.component').then((m) => m.PatientEditComponent),
    data: { breadcrumb: 'Editar Paciente' },
  },
  {
    path: 'history/:id',
    loadComponent: () =>
      import('./patients-history/patients-history.component').then((m) => m.PatientsHistoryComponent),
    data: { breadcrumb: 'Historial del Paciente' },
  },
] as Routes;

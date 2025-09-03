import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token
  const token = localStorage.getItem('token');

  // Clonar la solicitud y agregar el token si existe
  const authReq = token ? req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  }) : req;

  return next(authReq);
};

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error Interceptor:', error);

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        console.error('Error del cliente:', error.error.message);
      } else {
        // Error del lado del servidor
        console.error(
          `Código de error: ${error.status}, ` +
          `Mensaje: ${error.error?.message || error.message}`
        );

        // Manejar errores de autorización
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};

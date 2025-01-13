import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
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
      }

      return throwError(() => error);
    })
  );
};

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../../enviroment';
import { catchError, Observable, throwError } from 'rxjs';
import { RegisterUser } from './register-user';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrl = `${environment.apiUrl}/users/register`;

  constructor(private http: HttpClient) {}

  registerUser(data: RegisterUser): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.apiUrl, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ProgressEvent) {
          // Error del servidor no es un JSON válido
          return throwError(
            () => new Error('Error del servidor: ' + error.message)
          );
        } else {
          return throwError(
            () => new Error(error.error.message || 'Error desconocido')
          );
        }
      })
    );
  }
}

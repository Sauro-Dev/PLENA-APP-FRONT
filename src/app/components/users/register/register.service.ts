import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../../enviroment';
import { catchError, map, Observable, of, throwError } from 'rxjs';
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

  checkDNI(dni: string): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<{ dniTaken: boolean }>(
        `${environment.apiUrl}/users/validate?dni=${dni}`,
        { headers }
      )
      .pipe(
        map((response) => response.dniTaken),
        catchError(() => of(false))
      );
  }

  checkEmail(email: string): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<{ emailTaken: boolean }>(
        `${environment.apiUrl}/users/validate?email=${email}`,
        { headers }
      )
      .pipe(
        map((response) => response.emailTaken),
        catchError(() => of(false))
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, tap} from 'rxjs';
import { environment } from '../../enviroment';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users/login`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginRequest = { username, password };
    return this.http.post<any>(this.apiUrl, loginRequest).pipe(
      tap(response => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('firstLogin', response.firstLogin);
        }
      })
    );
  }
  setAuthenticatedUser(user: any): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getAuthenticatedUser(): any {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentUser = {
          username: decodedToken.username,
          role: decodedToken.role,
        };
        this.setAuthenticatedUser(currentUser);
        return currentUser;
      } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
      }
    }
    return null;
  }

  forgotPassword(data: { username: string; dni: string; newPassword: string }): Observable<void> {
    const url = `${environment.apiUrl}/users/forgot-password`;

    console.log('Realizando llamada HTTP al servidor:', data);

    return this.http.post<void>(url, data).pipe(
      tap(() => console.log('Solicitud enviada exitosamente al backend')),
      catchError((error) => {
        console.error('Error en forgotPassword:', error);
        throw error;
      })
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setAuthenticatedUser(null);
  }
}

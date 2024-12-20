import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import { environment } from '../../enviroment';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users/login`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
    // Opcional: guardar el usuario en localStorage si deseas persistencia en la sesión
    localStorage.setItem('user', JSON.stringify(user));
  }

  getAuthenticatedUser(): any {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const profile = { username: decodedToken.username, role: decodedToken.role };
        this.setAuthenticatedUser(profile);
        return profile;
      } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
      }
    }

    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.setAuthenticatedUser(null);
  }
}

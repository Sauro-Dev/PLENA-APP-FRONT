import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import { environment } from '../../enviroment';

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

  // Método para obtener el usuario actualmente autenticado
  getAuthenticatedUser(): any {
    return this.currentUserSubject.value || JSON.parse(localStorage.getItem('user') || 'null');
  }
}

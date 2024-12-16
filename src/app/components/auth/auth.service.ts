import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users/login`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginRequest = { username, password };
    return this.http.post<any>(this.apiUrl, loginRequest);
  }
}

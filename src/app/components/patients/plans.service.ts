import { Injectable } from '@angular/core';
import { environment } from '../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private apiUrl: string = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  createPlan(data: {
    numOfSessions: number
  }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/create`, data, {
      headers,
      responseType: 'json' as 'json',
    });
  }

  getAllPlans(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/list`, { headers });
  }
}

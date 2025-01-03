import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from './session';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getSessionsByDate(date: Date): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formattedDate = date.toISOString().split('T')[0];
    return this.http.get<Session[]>(`${this.apiUrl}/date?date=${formattedDate}`, {headers});
  }

  getSessionsByMonth(startDate: string): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Session[]>(`${this.apiUrl}/sessions-by-month?startDate=${startDate}`, {headers});
  }

  getSessionsByTherapist(therapistId: number): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Session[]>(`${this.apiUrl}/therapist/${therapistId}`, {headers});
  }

  presence(sessionId: number, therapistPresent: boolean, patientPresent: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/presence/${sessionId}`, { therapistPresent, patientPresent}, {headers});
  }

  reprogramSession(sesionId: number, reprogrammingData: any): Observable<any>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/update/${sesionId}`, reprogrammingData, {headers});
  }
}

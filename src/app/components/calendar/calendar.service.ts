import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from './session';
import { environment } from '../../enviroment';
import {Therapist} from "./therapist";
import {Room} from "./room";

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
    return this.http.get<Session[]>(`${this.apiUrl}/sessions-by-month?startDate=${startDate}`, {
      headers,
      params: {
        includePatientId: 'true' // Añade un parámetro para solicitar el ID del paciente
      }
    });
  }

  getSessionsByTherapist(therapistId: number): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Session[]>(`${this.apiUrl}/therapist/${therapistId}`, {headers});
  }

  getSessionsByRoom(roomId: number | undefined): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (roomId === undefined || roomId === null) {
      // Llamar a getSessionsByMonth como un fallback para todas las sesiones
      const startDate = new Date().toISOString().split('T')[0]; // Por ejemplo, la fecha actual
      return this.getSessionsByMonth(startDate);
    }

    return this.http.get<Session[]>(`${this.apiUrl}/sessions-byRoom/${roomId}`, { headers });
  }

  presence(sessionId: number, therapistPresent: boolean, patientPresent: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      sessionId: sessionId,
      therapistPresent: therapistPresent,
      patientPresent: patientPresent
    };

    return this.http.put<any>(`${this.apiUrl}/presence`, body, {headers});
  }

  reprogramSession(sesionId: number, reprogrammingData: any): Observable<any>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/update/${sesionId}`, reprogrammingData, {headers});
  }

  getFilteredSessions(params: HttpParams): Observable<Session[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Session[]>(`${this.apiUrl}/filtered`, { headers, params })
  }

  getAvailableTherapists(
    sessionDate: string,
    startTime: string,
    endTime: string
  ): Observable<Therapist[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Therapist[]>(
      `${this.apiUrl}/available-therapists?sessionDate=${sessionDate}&startTime=${startTime}&endTime=${endTime}`,
      { headers }
    );
  }

  getAvailableRooms(
    sessionDate: string,
    startTime: string,
    endTime: string
  ): Observable<Room[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Room[]>(
      `${this.apiUrl}/available-rooms?sessionDate=${sessionDate}&startTime=${startTime}&endTime=${endTime}`,
      { headers }
    );
  }
}

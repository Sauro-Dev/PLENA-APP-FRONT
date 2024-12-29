import { Injectable } from '@angular/core';
import { environment } from '../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterPatient } from './register-patient';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private apiUrl: string = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }
  createPatient(data: RegisterPatient): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/register`, data, {
      headers,
      responseType: 'json' as 'json',
    });
  }
  createSession(sessionData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `${environment.apiUrl}/sessions/register`,
      sessionData,
      { headers }
    );
  }

  getAllRooms(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}/rooms/all`, { headers });
  }

  getAvailableTherapists(
    sessionDate: string,
    startTime: string,
    endTime: string
  ): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(
      `${environment.apiUrl}/sessions/available-therapists`,
      { params: { sessionDate, startTime, endTime }, headers }
    );
  }
  getPatientById(patientId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/select/${patientId}`, {
      headers,
    });
  }
  updatePatient(patientId: number, patientData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(
      `${this.apiUrl}/select/${patientId}`,
      patientData,
      { headers }
    );
  }

  checkPatientDNI(dni: string, tutors: any[]): Observable<boolean> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<boolean>(`${this.apiUrl}/validate-dni`, {
      params: {
        dni: dni,
        tutors: JSON.stringify(tutors), // Pasar la lista de tutores como JSON
      },
      headers,
    });
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


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

  createPatient(data: {
    therapistId: number;
    birthdate: string;
    paternalSurname: any;
    firstWeekDates: any;
    maternalSurname: any;
    roomId: number;
    tutor: any;
    idPlan: number;
    presumptiveDiagnosis: any;
    name: any;
    startTime: any;
    dni: any;
    status: any
  }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/register`, data, {
      headers,
      responseType: 'json' as 'json',
    });
  }

  getAllRooms(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}/rooms/all`, { headers });
  }

  getAvailableTherapists(sessionDate: string, startTime: string, endTime: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}/sessions/available-therapists`, {params: { sessionDate, startTime, endTime }, headers});
  }

  getAvailableRooms(sessionDate: string, startTime: string, endTime: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}/sessions/available-rooms`, { params: { sessionDate, startTime, endTime }, headers });
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
        tutors: JSON.stringify(tutors),
      },
      headers,
    });
  }

  checkSessionAvailability(sessionDate: string, startTime: string, roomId: number, therapistId: number): Observable<any> {
    const params = {
      sessionDate,
      startTime,
      roomId: roomId.toString(),
      therapistId: therapistId.toString()
    };

    return this.http.get<any>(`${this.apiUrl}/validate-session`, {
      params,
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`)
    });
  }
}

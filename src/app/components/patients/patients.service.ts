import { Injectable } from '@angular/core';
import { environment } from '../../enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {RenewPlan} from "./renew-plan";
import {ListPatient} from "./list-patient";


@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private apiUrl: string = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<ListPatient[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ListPatient[]>(`${this.apiUrl}/all`, { headers });
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

  renewPlan(data: RenewPlan): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Asegurarnos de que los tipos numéricos sean números y no strings
    const processedData = {
      ...data,
      patientId: Number(data.patientId),
      newPlanId: Number(data.newPlanId),
      therapistId: Number(data.therapistId),
      roomId: Number(data.roomId)
    };

    console.log('Datos procesados antes de enviar:', processedData);

    return this.http.post<any>(`${this.apiUrl}/renew-plan`, processedData, { headers });
  }
}


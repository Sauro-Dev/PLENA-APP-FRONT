import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root',
})
export class PatientsHistoryService {
  private apiUrl: string = `${environment.apiUrl}/medicalHistory`;

  constructor(private http: HttpClient) {}

  registerMedicalHistory(medicalHistory: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/register`, medicalHistory, { headers });
  }

  findMedicalHistoryByPatientId(patientId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/find/${patientId}`, { headers });
  }
}

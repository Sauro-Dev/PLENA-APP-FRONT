import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationDocumentService {
  private apiUrl = `${environment.apiUrl}/evaluationDocument`;

  constructor(private http: HttpClient) {}

  getDocumentsByPatientId(patientId: number): Observable<any[]> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any[]>(`${this.apiUrl}/patient/${patientId}`, { headers });
  }

  getById(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.apiUrl}/select/${id}`, { headers });
  }

  create(document: any, file: File): Observable<any> {
    const headers = this.createAuthorizationHeader();
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('evaluationDocument', new Blob([JSON.stringify(document)], { type: 'application/json' }));
    return this.http.post<any>(`${this.apiUrl}/register`, formData, { headers });
  }

  update(id: number, document: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, document, { headers });
  }

  download(id: number): Observable<Blob> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(`${this.apiUrl}/download/${id}`, { headers, responseType: 'blob' });
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}

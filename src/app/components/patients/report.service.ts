import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/report`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.apiUrl}/select/${id}`, { headers });
  }

  create(report: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.post<any>(`${this.apiUrl}/register`, report, { headers });
  }

  update(id: number, report: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, report, { headers });
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}

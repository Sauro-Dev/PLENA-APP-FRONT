import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../enviroment";
import { Area } from './area-edit/area.model';

@Injectable({
  providedIn: 'root'
})
export class AreasService {
  private apiUrl: string = `${environment.apiUrl}/intervention-areas`;

  constructor(private http: HttpClient) {}

  getAreas(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/all`,{headers});
  }

  update(id: string, area: Area): Observable<Area> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Area>(`${this.apiUrl}/update/${id}`, area,{headers});
  }

  getAreaById(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${id}`,{headers});
  }
  deleteArea(id: string): Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`,{headers});
  }

  disableArea(areaId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<void>(`${this.apiUrl}/disable/${areaId}`, {}, { headers });
  }

  getDisabledAreas(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/disabled`, { headers });
  }

  enableArea(areaId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<void>(`${this.apiUrl}/enable/${areaId}`, {}, { headers });
  }
}

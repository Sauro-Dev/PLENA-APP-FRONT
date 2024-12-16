import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area } from './area.model';
import {environment} from "../../../enviroment";

@Injectable({
  providedIn: 'root',
})
export class AreaService {
    private apiUrl: string = `${environment.apiUrl}/api/v1/intervention-areas`;
  constructor(private http: HttpClient) {}

  getAreaById(id: string): Observable<Area> {
    return this.http.get<Area>(`${this.apiUrl}/${id}`);
  }

  updateArea(id: string, area: Area): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, area);
  }
}
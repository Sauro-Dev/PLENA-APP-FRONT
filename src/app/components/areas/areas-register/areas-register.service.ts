import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../enviroment";

@Injectable({
  providedIn: 'root'
})
export class AreasRegisterService {

  private apiUrl = `${environment.apiUrl}/intervention-areas/register`;

  constructor(private http: HttpClient) { }

  // Método para registrar un área de intervención
  registerArea(name: string, description: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`});
    const body = { name, description };

    return this.http.post(this.apiUrl, body, { headers });
  }
}

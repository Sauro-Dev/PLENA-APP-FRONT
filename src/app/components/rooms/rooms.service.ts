import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from './room';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // Método para registrar una sala
  registerRoom(room: Room): Observable<Room> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Room>(`${this.apiUrl}/register`, room, {headers});
  }

  // Método para obtener la lista de ambientes
  getRooms(): Observable<Room[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Room[]>(`${this.apiUrl}/all`,{headers});
  }

  // Método para obtener ambientes según si son terapéuticos o no
  getRoomsByTherapeutic(isTherapeutic: boolean): Observable<Room[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Room[]>(
      `${this.apiUrl}/therapeutic?isTherapeutic=${isTherapeutic}`,{headers}
    );
  }
  // Método para obtener un ambiente específico por ID
  getRoomById(roomId: string): Observable<Room> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`,{headers});
  }
  updateRoom(id: string, room: Room): Observable<Room> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Room>(`${this.apiUrl}/update/${id}`, room,{headers});
  }

  getDisabledRooms(): Observable<Room[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Room[]>(`${this.apiUrl}/disabled`, { headers });
  }

  enableRoom(roomId: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<string>(`${this.apiUrl}/enable/${roomId}`, {}, { headers });
  }

  disableRoom(roomId: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<string>(`${this.apiUrl}/disable/${roomId}`, {}, { headers });
  }

}

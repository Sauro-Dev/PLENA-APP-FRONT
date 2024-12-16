import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../enviroment";
import { Room } from '../room';

@Injectable({
    providedIn: 'root',
  })

  export class RoomsService {
  
    private apiUrl: string = `${environment.apiUrl}/api/v1/rooms`;
  constructor(private http: HttpClient) {}

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }
  updateRoom(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/update/${id}`, room);
  }

}
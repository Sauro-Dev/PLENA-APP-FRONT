import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment';
import { Material } from './material';
import { AreaInterventionResponse } from './areaIntervention';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  // Obtener todos los materiales
  getMaterials(): Observable<Material[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Material[]>(`${this.apiUrl}/all`, {headers});
  }

  // Obtener materiales asignados a una sala específica
  getMaterialsByRoom(roomId: string): Observable<Material[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Material[]>(`${environment.apiUrl}/rooms/${roomId}/materials`, {headers});
  }

  // Desasignar material de una sala
  unassignMaterialFromRoom(materialId: string): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<void>(`${this.apiUrl}/${materialId}/unassign`, {}, {headers});
  }

    // Desasignar material de una Area de Intervención
  unassignInterArea(id: string, area: AreaInterventionResponse): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${environment.apiUrl}/material-areas/unassignInterArea?materialId=${id}&interventionAreaId=${area.id}`, {headers});
  }
  // Asignar material a una sala
  assignMaterialToRoom(materialId: string, roomId: number): Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<void>(`${this.apiUrl}/${materialId}/assign/${roomId}`, {},{headers});
  }

  // Registrar nuevo material
  registerMaterial(material: Omit<Material, 'idMaterial'>): Observable<Material> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Material>(`${this.apiUrl}/register`, material, {headers});
  }

  // Editar material
  updateMaterial(id: string, material: Material): Observable<Material> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Material>(`${this.apiUrl}/update/${id}`, material, {headers});
  }
  // Obtener un material por su id
  getMaterialById(id: string): Observable<Material> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Material>(`${this.apiUrl}/select/${id}`, {headers});
  }
  // Obtener los materiales que no han sido asignados
  getUnassignedMaterials(): Observable<Material[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const timestamp = new Date().getTime();
    return this.http.get<Material[]>(`${this.apiUrl}/unassigned?v=${timestamp}`, {headers});
  }
  // Eliminar material
  deleteMaterial(materialId: string): Observable<void>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${materialId}`, {headers});
  }
  getInterventionAreas(materialId: string): Observable<any>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}/intervention-areas/find/${materialId}`, {headers});
  }
  getAllInterventionAreas(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}/intervention-areas/all`,{headers});
  }
  assignMaterialInterArea(materialId: string, interventionAreaId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<void>(`${environment.apiUrl}/material-areas/register?materialId=${materialId}&interventionAreaId=${interventionAreaId}`, {}, { headers });
  }
}

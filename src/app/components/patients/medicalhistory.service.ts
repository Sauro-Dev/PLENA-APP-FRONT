import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../enviroment";

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  private evalDocUrl = `${environment.apiUrl}/evaluationDocument`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDocumentsByMedicalHistory(medicalHistoryId: number): Observable<EvaluationDocument[]> {
    return this.http.get<EvaluationDocument[]>(
      `${this.evalDocUrl}/medical-history/${medicalHistoryId}`,
      { headers: this.getHeaders() }
    );
  }

  uploadDocument(patientId: number, medicalHistoryId: number, formData: FormData): Observable<EvaluationDocument> {
    return this.http.post<EvaluationDocument>(
      `${this.evalDocUrl}/patient/${patientId}/medical-history/${medicalHistoryId}/upload`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.evalDocUrl}/${documentId}`,
      { headers: this.getHeaders() }
    );
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(
      `${this.evalDocUrl}/${documentId}/download`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }
}

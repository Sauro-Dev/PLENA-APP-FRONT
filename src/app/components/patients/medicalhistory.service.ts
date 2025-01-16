import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from "../../enviroment";
import { EvaluationDocument } from "./evaluation-document";
import { Report } from "./Report";
import { ListMedicalHistory } from "./list-medical-history";

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  getMedicalHistoryByPatientId(patientId: number): Observable<ListMedicalHistory[]> {
    return this.http.get<ListMedicalHistory[]>(
      `${this.apiUrl}/medical-history/patient/${patientId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error procesando la respuesta:', error);
        return throwError(() => error);
      })
    );
  }

  getDocumentsByMedicalHistory(medicalHistoryId: number): Observable<EvaluationDocument[]> {
    return this.http.get<EvaluationDocument[]>(
      `${this.apiUrl}/evaluationDocument/medical-history/${medicalHistoryId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error obteniendo documentos:', error);
        return throwError(() => error);
      })
    );
  }

  uploadDocument(patientId: number, medicalHistoryId: number, formData: FormData): Observable<EvaluationDocument> {
    return this.http.post<EvaluationDocument>(
      `${this.apiUrl}/evaluationDocument/patient/${patientId}/medical-history/${medicalHistoryId}/upload`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/evaluationDocument/${documentId}`,
      { headers: this.getHeaders() }
    );
  }

  getReportsByMedicalHistory(medicalHistoryId: number): Observable<Report[]> {
    return this.http.get<Report[]>(
      `${this.apiUrl}/report/medical-history/${medicalHistoryId}`,
      { headers: this.getHeaders() }
    );
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/report/${reportId}`,
      { headers: this.getHeaders() }
    );
  }

  downloadEvaluationDocument(medicalHistoryId: number, document: EvaluationDocument): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/evaluationDocument/medical-history/${medicalHistoryId}/document/${document.idDocument}/download`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  downloadReport(medicalHistoryId: number, report: Report): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/report/medical-history/${medicalHistoryId}/document/${report.idReport}/download`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  canUploadReport(patientId: number, medicalHistoryId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/report/medical-history/${medicalHistoryId}/patient/${patientId}/can-upload`,
      { headers: this.getHeaders() }
    );
  }
}

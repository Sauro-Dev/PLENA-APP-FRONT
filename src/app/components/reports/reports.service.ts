import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {catchError, Observable, switchMap, throwError} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  // Reporte general de sesiones
  generateGeneralReport(startDate?: string, endDate?: string): Observable<HttpResponse<Blob>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/report/all/pdf`, {
      headers,
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  // Método para descargar el PDF
  downloadPdf(response: HttpResponse<Blob>, defaultFilename: string = 'reporte.pdf'): void {
    // Verificar que response.body no sea null
    if (response.body) {
      const blob = new Blob([response.body], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : defaultFilename;

      link.download = filename;
      link.click();

      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.error('No se pudo obtener el cuerpo de la respuesta para descargar el PDF');
    }
  }

  // Reporte de sesiones por terapeuta
  generateTherapistReport(therapistId: number, startDate?: string, endDate?: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/report/therapist/${therapistId}/pdf`, {
      headers,
      params,
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => {
        if (response.body instanceof Blob) {
          this.downloadPdf(response, `reporte_sesiones_terapeuta_${therapistId}.pdf`);
          return response.body;
        } else {
          throw new Error('La respuesta no contiene un blob válido');
        }
      })
    );
  }

  generatePatientReport(patientId: number, startDate?: string, endDate?: string): Observable<HttpResponse<Blob>> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/report/patient/${patientId}/pdf`, {
      headers,
      params,
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => {
        // Verificar si el PDF está vacío (tamaño 0 bytes o muy pequeño)
        if (!response.body || response.body.size <= 100) { // Un PDF vacío típicamente pesa muy poco
          throw new HttpErrorResponse({
            status: 404,
            statusText: 'No Data Found'
          });
        }
        return response;
      }),
      catchError(error => throwError(() => error))
    );
  }
}


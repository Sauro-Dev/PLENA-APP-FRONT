import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  private getFilenameFromResponse(response: HttpResponse<Blob>): string {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return 'reporte.pdf';
  }

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

  generateTherapistReport(therapistId: number, startDate?: string, endDate?: string): Observable<HttpResponse<Blob>> {
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
    });
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
        if (!response.body || response.body.size <= 16 * 1024) {
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

  downloadPdf(response: HttpResponse<Blob>, defaultFilename: string = 'reporte.pdf'): void {
    if (response.body) {
      const blob = new Blob([response.body], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const filename = this.getFilenameFromResponse(response) || defaultFilename;
      link.download = filename;

      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      console.error('No se pudo obtener el cuerpo de la respuesta para descargar el PDF');
    }
  }
}

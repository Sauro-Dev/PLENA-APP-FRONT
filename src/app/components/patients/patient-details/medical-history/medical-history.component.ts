import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MedicalHistoryService} from "../../medicalhistory.service";
import {ActivatedRoute} from "@angular/router";
import {CommonModule} from "@angular/common";
import {EvaluationDocument} from "../../evaluation-document";
import {Report} from "../../Report";
import {finalize} from "rxjs";

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.css'
})
export class MedicalHistoryComponent implements OnInit {
  documents: EvaluationDocument[] = [];
  reports: Report[] = [];
  isLoading = true;
  showUploadModal = false;
  showDeleteModal = false;
  selectedDocument: EvaluationDocument | Report | null = null;
  medicalHistoryId!: number;
  patientId!: number;
  viewType: 'evaluations' | 'reports' = 'evaluations';
  canUploadReport: boolean = false;
  uploadReportMessage: string = '';

  sortField: 'date' | 'size' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  isGridView = true;

  newDocument = {
    name: '',
    description: '',
    file: null as File | null,
    evaluationType: ''
  };

  newReport = {
    name: '',
    description: '',
    file: null as File | null,
    startDate: '',
    endDate: ''
  };

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private route: ActivatedRoute
  ) {
  }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = Number(params['id']);
      if (!isNaN(this.patientId)) {
        this.loadInitialData();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.medicalHistoryService.getMedicalHistoryByPatientId(this.patientId)
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            this.medicalHistoryId = response[0].id;
            this.loadDocuments();
            this.loadReports();
            this.checkCanUploadReport();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
  }

  loadDocuments(): void {
    if (!this.medicalHistoryId) return;
    this.isLoading = true;
    this.medicalHistoryService.getDocumentsByMedicalHistory(this.medicalHistoryId).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (docs) => {
        docs.forEach(doc => {
          if (Array.isArray(doc.uploadAt)) {
            doc.uploadAt = this.convertToDate(doc.uploadAt).toISOString();
          }
        });
        this.documents = docs;
        this.sortItems('evaluations');
      }, error: (error) => console.error('Error cargando documentos:', error)
    });
  }

  loadReports(): void {
    if (!this.medicalHistoryId) return;
    this.isLoading = true;
    this.medicalHistoryService.getReportsByMedicalHistory(this.medicalHistoryId).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (reps) => {
        reps.forEach(rep => {
          if (Array.isArray(rep.uploadAt)) {
            rep.uploadAt = this.convertToDate(rep.uploadAt).toISOString();
          }
        });
        this.reports = reps;
        this.sortItems('reports');
      }, error: (error) => console.error('Error cargando reportes:', error)
    });
  }

  private convertToDate(dateArray: number[]): Date {
    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  changeView(type: 'evaluations' | 'reports'): void {
    this.viewType = type;
    if (type === 'reports') {
      this.checkCanUploadReport();
    }
  }

  isViewActive(type: 'evaluations' | 'reports'): boolean {
    return this.viewType === type;
  }

  toggleSort(field: 'date' | 'size'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.sortItems(this.viewType);
  }

  private sortItems(type: 'evaluations' | 'reports'): void {
    const items = type === 'evaluations' ? this.documents : this.reports;
    items.sort((a, b) => {
      let comparison: number;

      if (this.sortField === 'date') {
        comparison = new Date(b.uploadAt).getTime() - new Date(a.uploadAt).getTime();
      } else {
        comparison = b.fileSize - a.fileSize;
      }

      return this.sortDirection === 'asc' ? -comparison : comparison;
    });
  }

  getSortIcon(field: 'date' | 'size'): string {
    if (this.sortField !== field) return 'ti ti-arrows-sort';
    return this.sortDirection === 'asc' ? 'ti ti-sort-ascending' : 'ti ti-sort-descending';
  }

  toggleView(): void {
    this.isGridView = !this.isGridView;
  }

  openUploadModal(): void {
    this.showUploadModal = true;
    this.resetForms();
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.resetForms();
  }

  openDeleteModal(item: EvaluationDocument | Report): void {
    this.selectedDocument = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDocument = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (this.viewType === 'evaluations') {
        this.newDocument.file = input.files[0];
      } else {
        this.newReport.file = input.files[0];
      }
    }
  }

  isValidUpload(): boolean {
    return !!(this.newDocument.name &&
      this.newDocument.description &&
      this.newDocument.file);
  }

  uploadDocument(): void {
    if (!this.isValidUpload()) return;

    const formData = new FormData();

    formData.append('file', this.newDocument.file!);
    formData.append('name', this.newDocument.name);
    formData.append('description', this.newDocument.description);

    this.medicalHistoryService.uploadDocument(this.patientId, this.medicalHistoryId, formData)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.closeUploadModal();
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error en la subida:', error);
        }
      });
  }

  downloadDocument(item: EvaluationDocument | Report): void {
    const downloadObservable = this.viewType === 'evaluations'
      ? this.medicalHistoryService.downloadEvaluationDocument(this.medicalHistoryId, item as EvaluationDocument)
      : this.medicalHistoryService.downloadReport(this.medicalHistoryId, item as Report);

    downloadObservable.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.fileName || 'documento';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.readAsText(error.error);
          reader.onload = () => {
            const errorMessage = JSON.parse(reader.result as string);
            console.error('Error en la descarga:', errorMessage.error);
          };
        } else {
          console.error('Error en la descarga:', error);
        }
      }
    });
  }

  confirmDelete(): void {
    if (!this.selectedDocument) return;

    this.isLoading = true;
    const deleteOperation = this.viewType === 'evaluations'
      ? this.medicalHistoryService.deleteDocument((this.selectedDocument as EvaluationDocument).idDocument)
      : this.medicalHistoryService.deleteReport((this.selectedDocument as Report).idReport);

    deleteOperation.pipe(
      finalize(() => {
        this.isLoading = false;
        this.closeDeleteModal();
      })
    ).subscribe({
      next: () => {
        if (this.viewType === 'evaluations') {
          this.loadDocuments();
        } else {
          this.loadReports();
          this.checkCanUploadReport();
        }
      },
      error: (error) => console.error('Error al eliminar:', error)
    });
  }

  checkCanUploadReport(): void {
    if (!this.patientId || !this.medicalHistoryId) return;

    this.medicalHistoryService.canUploadReport(this.patientId, this.medicalHistoryId)
      .subscribe({
        next: (response) => {
          this.canUploadReport = response.canUpload;
          this.uploadReportMessage = response.message;
        },
        error: (error) => console.error('Error checking report upload status:', error)
      });
  }

  private resetForms(): void {
    this.newDocument = {
      name: '',
      description: '',
      file: null,
      evaluationType: ''
    };
    this.newReport = {
      name: '',
      description: '',
      file: null,
      startDate: '',
      endDate: ''
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(contentType: string | undefined): string {
    if (!contentType) return 'ti ti-file-text';

    switch (contentType.toLowerCase()) {
      case 'application/pdf':
        return 'ti ti-file-type-pdf';
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
        return 'ti ti-file-type-jpg';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'ti ti-file-type-doc';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'ti ti-file-type-xls';
      default:
        return 'ti ti-file-text';
    }
  }
}

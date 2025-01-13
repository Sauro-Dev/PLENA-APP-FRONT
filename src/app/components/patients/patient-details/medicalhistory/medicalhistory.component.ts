import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MedicalHistoryService} from "../../medicalhistory.service";

@Component({
  selector: 'app-medicalhistory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicalhistory.component.html'
})
export class MedicalHistoryComponent implements OnInit {
  documents: EvaluationDocument[] = [];
  isLoading = true;
  showUploadModal = false;
  showDeleteModal = false;
  selectedDocument: EvaluationDocument | null = null;
  medicalHistoryId!: number;
  patientId!: number;

  newDocument = {
    name: '',
    description: '',
    file: null as File | null
  };

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.params['patientId']);
    this.medicalHistoryId = Number(this.route.snapshot.params['id']);
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.medicalHistoryService.getDocumentsByMedicalHistory(this.medicalHistoryId)
      .subscribe({
        next: (docs) => {
          this.documents = docs;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.isLoading = false;
        }
      });
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.resetNewDocument();
  }

  openDeleteModal(document: EvaluationDocument): void {
    this.selectedDocument = document;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDocument = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newDocument.file = file;
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
      .subscribe({
        next: () => {
          this.closeUploadModal();
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error uploading document:', error);
        }
      });
  }

  downloadDocument(document: EvaluationDocument): void {
    this.medicalHistoryService.downloadDocument(document.idDocument)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = document.name;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading document:', error);
        }
      });
  }

  confirmDelete(): void {
    if (!this.selectedDocument) return;

    this.medicalHistoryService.deleteDocument(this.selectedDocument.idDocument)
      .subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
        }
      });
  }

  private resetNewDocument(): void {
    this.newDocument = {
      name: '',
      description: '',
      file: null
    };
  }
}

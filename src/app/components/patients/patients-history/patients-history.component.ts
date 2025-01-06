import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluationDocumentService} from "../evaluation-document.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-patients-history',
  standalone: true,
  templateUrl: './patients-history.component.html',
  styleUrls: ['./patients-history.component.css'],
  imports: [CommonModule]
})
export class PatientsHistoryComponent implements OnInit {
  patient: any;
  history: any[] = [];
  documents: any[] = [];
  isLoading = true;

  constructor(private evaluationDocumentService: EvaluationDocumentService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadPatientHistory();
  }

  loadPatientHistory(): void {
    const patientId = this.route.snapshot.params['id'];
    this.evaluationDocumentService.getDocumentsByPatientId(patientId).subscribe(
      (documents) => {
        this.documents = documents;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching documents', error);
        this.isLoading = false;
      }
    );
  }

  downloadDocument(documentId: number): void {
    this.evaluationDocumentService.download(documentId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading document', error);
      }
    );
  }

  getDocumentById(documentId: number): void {
    this.evaluationDocumentService.getById(documentId).subscribe(
      (document) => {
        console.log('Document:', document);
        // Handle the document as needed
      },
      (error) => {
        console.error('Error fetching document', error);
      }
    );
  }

  addDocument(): void {
    const newDocument = {
      name: 'Nuevo Documento',
      description: 'Descripción del nuevo documento',
      documentType: 'Tipo de Documento'
    };
    const file = new File([''], 'dummy.pdf'); // Archivo de ejemplo, reemplazar según sea necesario

    this.evaluationDocumentService.create(newDocument, file).subscribe(
      (document) => {
        this.documents.push(document);
      },
      (error) => {
        console.error('Error creando documento', error);
      }
    );
  }
}

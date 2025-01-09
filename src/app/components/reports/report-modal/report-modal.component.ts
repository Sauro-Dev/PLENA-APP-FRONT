import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  templateUrl: './report-modal.component.html',
  imports: [
    NgIf
  ]
})
export class ReportModalComponent {
  showDownloadButton = false;

  constructor(public dialogRef: MatDialogRef<ReportModalComponent>) {}

  generateReport(): void {
    // Logic to generate the report
    this.showDownloadButton = true;
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}

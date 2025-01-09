import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../users/users.service';
import { ReportModalComponent} from "./report-modal/report-modal.component";
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  imports: [
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./reports.component.css']
})
// reports.component.ts
export class ReportsComponent implements OnInit {
  therapists: { id: string; name: string }[] = [];
  selectedTherapistId: string = ''; // Inicializar a una cadena vacía

  constructor(private usersService: UsersService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.usersService.getTherapists().subscribe(therapists => {
      this.therapists = therapists;
    });
  }

  onTherapistChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTherapistId = selectElement.value;
    console.log('Selected Therapist ID:', this.selectedTherapistId);
    // Lógica adicional cuando cambia el terapeuta
  }
  openReportModal(): void {
    this.dialog.open(ReportModalComponent);
  }
}

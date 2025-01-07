import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  isLoading = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadPatientHistory();
  }

  loadPatientHistory(): void {
    const patientId = this.route.snapshot.params['id'];
    // Aquí puedes agregar la lógica para cargar el historial del paciente
    this.isLoading = false;
  }
}

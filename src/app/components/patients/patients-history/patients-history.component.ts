import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientsService } from '../patients.service';

@Component({
  selector: 'app-patients-history',
  standalone: true,
  templateUrl: './patients-history.component.html',
  styleUrls: ['./patients-history.component.css']
})
export class PatientsHistoryComponent implements OnInit {
  patient: any = null;
  history: any = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id']; // El signo + convierte el id a número
      if (id) {
        this.loadPatientHistory(id);
      } else {
        console.error('ID de paciente no proporcionado.');
      }
    });
  }

  loadPatientHistory(id: number): void {
    this.patientsService.getPatientById(id).subscribe(
      (data: any) => {
        this.patient = data.patient;
        this.history = data.history;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error al cargar el historial del paciente:', error);
        this.isLoading = false;
      }
    );
  }
}

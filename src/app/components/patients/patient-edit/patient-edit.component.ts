import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../patients.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterPatient } from '../register-patient';
import { CommonModule } from '@angular/common';
import { Tutor } from '../tutor';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class PatientEditComponent implements OnInit {
  patient: RegisterPatient | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  showSaveModal: boolean = false;
  showCancelModal: boolean = false;

  constructor(
    private patientsService: PatientsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPatient(id);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  loadPatient(id: number): void {
    this.patientsService.getPatientById(id).subscribe(
      (data) => {
        this.patient = {
          name: data.name,
          paternalSurname: data.paternalSurname,
          maternalSurname: data.maternalSurname || '',
          dni: data.dni || '',
          birthDate: new Date(data.birthdate),
          age: data.age,
          presumptiveDiagnosis: data.presumptiveDiagnosis || '',
          idPlan: data.idPlan || 0,
          tutors: data.tutors || [],
        };
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  savePatient(): void {
    if (!this.patient) {
      return;
    }
    const updateData = {
      idPatient: this.route.snapshot.params['id'],
      name: this.patient.name,
      paternalSurname: this.patient.paternalSurname,
      maternalSurname: this.patient.maternalSurname,
      dni: this.patient.dni,
      birthdate: this.patient.birthDate,
      presumptiveDiagnosis: this.patient.presumptiveDiagnosis,
      idPlan: this.patient.idPlan,
      tutors: this.patient.tutors,
    };
    this.isSaving = true;
    this.patientsService
      .updatePatient(this.route.snapshot.params['id'], updateData)
      .subscribe(
        () => {
          this.isSaving = false;
          this.router.navigate([
            '/patients/details',
            this.route.snapshot.params['id'],
          ]);
        },
        () => {
          this.isSaving = false;
        }
      );
  }

  onTutorChange<T extends keyof Tutor>(
    value: any,
    index: number,
    field: T
  ): void {
    if (this.patient && this.patient.tutors[index]) {
      this.patient.tutors[index][field] = value;
    }
  }

  onlyNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  openSaveModal(): void {
    this.showSaveModal = true;
  }

  closeSaveModal(): void {
    this.showSaveModal = false;
  }

  confirmSave(): void {
    this.showSaveModal = false;
    this.savePatient();
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.showCancelModal = false;
    this.router.navigate([
      '/patients/details',
      this.route.snapshot.params['id'],
    ]);
  }
}

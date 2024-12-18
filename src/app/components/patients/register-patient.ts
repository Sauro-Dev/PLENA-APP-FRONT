export interface RegisterPatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthDate: Date;
  age: number;
  allergies: string;
  idPlan: number;
  tutors:[];
}

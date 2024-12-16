export interface RegisterPatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: Date;
  age: number;
  allergies: string;
  idPlan: number;
  tutors:[];
}

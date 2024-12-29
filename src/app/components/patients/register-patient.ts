import { Tutor } from './tutor';

export interface RegisterPatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthDate: Date;
  age: number;
  presumptiveDiagnosis: string;
  idPlan: number;
  tutors: Tutor[];
}

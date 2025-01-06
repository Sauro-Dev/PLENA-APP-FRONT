import { Tutor } from './tutor';

export interface RegisterPatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthDate: string;
  age: number;
  presumptiveDiagnosis: string;
  idPlan: number;
  tutors: Tutor[];
  status: boolean;
}

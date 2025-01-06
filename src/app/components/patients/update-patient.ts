import { Tutor } from './tutor';

export interface UpdatePatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthDate: string;
  presumptiveDiagnosis: string;
  age: number;
  status: boolean;
  idPlan: number;
  tutors: Tutor[];
}

import { Tutor } from './tutor';
import { PlanStatus} from "./plan-status";

export interface Patient {
  idPatient: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthdate: string;
  age: number;
  planId: number;
  planStatus: PlanStatus;
  tutors: Tutor[];
  presumptiveDiagnosis: string;
  status: boolean;
}

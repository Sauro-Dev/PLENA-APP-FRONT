import { Tutor } from './tutor';

export interface RegisterPatient {
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
  therapistId: number;
  roomId: number;
  startTime: string;
  firstWeekDates: string[];
}


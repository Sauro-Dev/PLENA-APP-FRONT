import { Tutor } from './tutor';

export interface RegisterPatient {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthdate: string; // Changed to string to match backend
  presumptiveDiagnosis: string;
  status: boolean;
  idPlan: number;
  tutors: Tutor[];
  therapistId: number;
  roomId: number;
  startTime: string;
  firstWeekDates: string[];
}

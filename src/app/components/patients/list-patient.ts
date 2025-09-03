export interface ListPatient {
  idPatient: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  dni: string;
  birthdate: string;
  age: number;
  planId: number;
  planStatus: string; // Asume que es un string basado en el enum
  tutors: any[]; // Ajusta según la estructura real
  presumptiveDiagnosis: string;
  status: boolean;
}

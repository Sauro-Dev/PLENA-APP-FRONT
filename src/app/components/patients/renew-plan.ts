export interface RenewPlan {
  patientId: number;        // Equivalente a Long
  newPlanId: number;        // Equivalente a Long
  startTime: string;        // Enviamos string que luego se convertirá a LocalTime
  firstWeekDates: string[]; // Array de strings en formato ISO para LocalDate
  therapistId: number;      // Equivalente a Long
  roomId: number;          // Equivalente a Long
}

export interface Session {
  idSession: number;
  therapistId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  patientName: string;
  therapistName: string;
  roomName: string;
  rescheduled: boolean;
  therapistPresent: boolean;
  patientPresent: boolean;
  reason?: string;
}

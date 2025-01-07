export interface EventDetails {
  patientName: string;
  therapistName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  sessionDate: string;
  therapistId: number;
  sessionId: number;
  therapistPresent: boolean;
  patientPresent: boolean;
  rescheduled: boolean;
  reason?: string;
}

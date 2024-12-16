export interface Session {
    idSession: number;
    sessionDate: string;
    startTime: string;
    endTime: string;
    patientName: string;
    therapistName: string;
    roomName: string;
    rescheduled: boolean;
    therapistPresent: boolean;
    patientPresent: boolean;
  }
  
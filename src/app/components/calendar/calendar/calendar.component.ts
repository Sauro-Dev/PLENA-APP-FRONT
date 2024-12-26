import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { CalendarService } from '../calendar.service';


import { Session } from '../session';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit{
  selectedDate: string = '';
  selectedFilter: string = 'day';
  sessions: any[] = [];
  hours: string[] = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];

  showModal: boolean = false;
  showDetailsModal: boolean = false;
  showReprogrammingModal: boolean = false; 

  selectedSession: Session | null = null;
  therapistPresent: boolean = false;
  patientPresent: boolean = false;

  newSessionDate: string = '';
  newStartTime: string = '';
  newEndTime: string = '';
  reason: string = '';
  
  constructor(private calendarService: CalendarService ){}

  ngOnInit(): void {
    this.onFilterSessions
  }

  onFilterSessions() {
    if (!this.selectedDate) return;
  
    const date: Date = new Date(this.selectedDate);
    this.calendarService.getSessionsByDate(date).subscribe(
      data => this.sessions = data.length > 0 ? data : [],
      error => {
        console.error('Error al obtener sesiones:', error);
        this.sessions = [];
      }
    );
  }
  openPresenceModal(session: Session) {
    this.selectedSession = session;
    this.therapistPresent = session.therapistPresent;
    this.patientPresent = session.patientPresent;
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  registerPresence() {
    if (this.selectedSession) {
      this.calendarService.presence(this.selectedSession.idSession, this.therapistPresent, this.patientPresent).subscribe(
        () => {
          this.closeModal();
          this.onFilterSessions();
        },
        error => console.error('Error al registrar asistencia:', error)
      );
    }
  }

  getSessionsForHour(hour: string) {
    return this.sessions.filter(session => this.getFormattedHour(session.startTime) === hour);
  }

  getFormattedHour(time: string): string {
    const hour = parseInt(time.split(':')[0], 10);
    return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
  }
  openDetailsModal(session: Session) {
    this.selectedSession = session;
    this.showDetailsModal = true;    
  }
  closeDetailsModal() {
    this.showDetailsModal = false; 
  }
  openReprogrammingModal(session: Session) {
    this.selectedSession = session;
    this.newSessionDate = session.sessionDate;
    this.newStartTime = session.startTime;
    this.newEndTime = session.endTime;
    this.reason = '';  
    this.showReprogrammingModal = true;
  }
  closeReprogrammingModal() {
    this.showReprogrammingModal = false;
  }

  sendReprogramming() {
    if (!this.isValidTime(this.newStartTime) || !this.isValidTime(this.newEndTime)) {
      return;
    }
    if (this.isStartTimeGreaterThanEndTime(this.newStartTime, this.newEndTime)) {
      return;
    }
    if (this.selectedSession) {
      const reprogrammingData = {
        sessionDate: this.newSessionDate,
        startTime: this.newStartTime,
        endTime: this.newEndTime,
        reason: this.reason
      };

      this.calendarService.reprogramSession(this.selectedSession.idSession, reprogrammingData).subscribe(
        () => {
          this.closeReprogrammingModal();
          this.onFilterSessions();
        },
        error => console.error('Error al reprogramar sesión:', error)
      );
    }
  }
  isValidTime(time: string): boolean {
    return time >= '09:00' && time <= '21:00';
  }
  isStartTimeGreaterThanEndTime(startTime: string, endTime: string): boolean {
    return this.convertTimeTo24Hour(startTime) >= this.convertTimeTo24Hour(endTime);
  }
  convertTimeTo24Hour(time: string): number {
    const [hour, minute] = time.split(':').map(num => parseInt(num, 10));
    const isPM = time.includes('PM');
    const isAM = time.includes('AM');

    let hour24 = hour;
    if (isPM && hour !== 12) hour24 += 12;
    if (isAM && hour === 12) hour24 = 0;

    return hour24 * 60 + minute;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../calendar.service';
import { Session } from '../session';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import {UsersService} from "../../users/users.service";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  selectedDate: string = '';
  selectedTherapistId: string = '';
  therapists: Array<{ id: string; name: string }> = [];
  sessions: Session[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin],
    initialView: 'timeGridWeek',
    slotMinTime: '09:00:00',
    slotMaxTime: '19:00:00',
    businessHours: [
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '13:00' },
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '15:00', endTime: '19:00' },
    ],
    allDaySlot: false,
    editable: false,
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay',
    },
    events: [],
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
  };

  constructor(private calendarService: CalendarService, private usersService: UsersService) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadTherapists();
    this.loadSessions();
  }

  onFilterChange(): void {
    console.log('Cambio en los filtros:', { selectedDate: this.selectedDate, selectedTherapistId: this.selectedTherapistId });
    this.loadSessions();
  }

  loadSessions(): void {
    if (this.selectedDate && this.selectedTherapistId) {
      // Filtro por fecha y terapeuta
      const date = new Date(this.selectedDate);
      this.calendarService.getSessionsByDate(date).subscribe({
        next: (sessionsByDate) => {
          const filteredSessions = sessionsByDate.filter(
            (session) => session.therapistId === parseInt(this.selectedTherapistId)
          );
          this.updateCalendarEvents(filteredSessions);
        },
        error: (err) => console.error('Error al cargar sesiones por fecha y terapeuta:', err),
      });
    } else if (this.selectedDate) {
      // Solo filtro por fecha
      const date = new Date(this.selectedDate);
      this.calendarService.getSessionsByDate(date).subscribe({
        next: (sessions) => this.updateCalendarEvents(sessions),
        error: (err) => {
          console.error('Error al cargar sesiones por fecha:', err);
          if (err.status === 404) {
            console.warn(`No se encontraron sesiones para la fecha: ${this.selectedDate}`);
            this.updateCalendarEvents([]); // Limpia el calendario
          }
        },
      });
    } else if (this.selectedTherapistId) {
      // Validar si therapistId es un número válido
      const therapistId = parseInt(this.selectedTherapistId);
      if (!isNaN(therapistId)) {
        this.calendarService.getSessionsByTherapist(therapistId).subscribe({
          next: (sessions) => this.updateCalendarEvents(sessions),
          error: (err) => console.error('Error al cargar sesiones por terapeuta:', err),
        });
      } else {
        console.warn('El therapistId no es válido:', this.selectedTherapistId);
      }
    } else {
      // Sin filtros: cargar sesiones del mes actual
      const currentMonthDate = new Date(); // Fecha actual para determinar el mes
      this.calendarService.getSessionsByMonth(currentMonthDate.toISOString().split('T')[0]).subscribe({
        next: (sessions) => this.updateCalendarEvents(sessions),
        error: (err) => console.error('Error al cargar sesiones del mes:', err),
      });
    }
  }

  private updateCalendarEvents(sessions: Session[]): void {
    const events = sessions.map((session) => {
      const normalizedStart = session.startTime.trim().replace(/\s+/g, ' '); // Normalizar hora inicio
      const normalizedEnd = session.endTime.trim().replace(/\s+/g, ' ');     // Normalizar hora fin
      return {
        title: `${session.therapistName} - ${session.patientName}`,
        start: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedStart)}`,
        end: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedEnd)}`,
        backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
      };
    });

    this.calendarOptions = { ...this.calendarOptions, events }; // Actualiza el calendario
  }

  loadTherapists(): void {
    this.usersService.getTherapists().subscribe({
      next: (therapists) => {
        this.therapists = therapists.map(therapist => ({
          id: therapist.id,
          name: therapist.name
        }));
        console.log('Terapeutas cargados:', this.therapists);
      },
      error: (err) => console.error('Error al cargar terapeutas:', err),
    });
  }
}

function convertTimeTo24HourFormat(time: string): string {
  // Expresión regular mejorada para capturar variaciones de formato
  const timeRegex = /(\d{1,2}):(\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)/i;
  const match = time.match(timeRegex);

  if (!match) throw new Error(`Formato de hora inválido: ${time}`); // Si no coincide, lanza un error

  let [_, hour, minute, meridian] = match; // Extrae las partes de la hora
  let hour24 = parseInt(hour, 10);

  if (meridian.toLowerCase().includes("p") && hour24 < 12) hour24 += 12; // Convertir PM
  if (meridian.toLowerCase().includes("a") && hour24 === 12) hour24 = 0; // Medianoche en AM

  return `${hour24.toString().padStart(2, "0")}:${minute}:00`; // Devuelve en formato 24 horas
}

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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
  selectedDate: string = '';
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

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    const todayDate = new Date().toISOString().split('T')[0];
    this.calendarService.getSessionsByMonth(todayDate).subscribe({
      next: (sessions: Session[]) => {
        console.log('Formato de horas recibidas:', sessions.map(s => s.startTime)); // Validar horas aquí
        const events = sessions.map(session => {
          const normalizedStart = session.startTime.trim().replace(/\s+/g, ' '); // Normalizamos hora de inicio
          const normalizedEnd = session.endTime.trim().replace(/\s+/g, ' '); // Normalizamos hora de fin
          return {
            title: `${session.therapistName} - ${session.patientName}`,
            start: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedStart)}`,
            end: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedEnd)}`,
            backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
            borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
          };
        });

        console.log('Eventos generados:', events);
        this.calendarOptions = { ...this.calendarOptions, events };
      },
      error: err => console.error('Error al cargar sesiones desde el backend:', err),
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

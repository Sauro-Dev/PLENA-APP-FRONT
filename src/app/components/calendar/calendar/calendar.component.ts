import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../calendar.service';
import { Session } from '../session';
import { FullCalendarModule } from '@fullcalendar/angular';
import {FullCalendarComponent} from "@fullcalendar/angular";
import {ViewChild} from "@angular/core";
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import {UsersService} from "../../users/users.service";
import {RoomsService} from "../../rooms/rooms.service";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  selectedDate: string = '';
  noSessionsModal: boolean = false;
  selectedTherapistId: string = '';
  therapists: Array<{ id: string; name: string }> = [];
  selectedRoomId: number | undefined;
  rooms: Array<{ id: number | undefined; name: string }> = [];
  sessions: Session[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin],
    initialView: 'timeGridWeek',
    initialDate: new Date().toISOString().split('T')[0],
    slotMinTime: '09:00:00',
    slotMaxTime: '20:00:00',
    businessHours: [
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '13:00' },
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '15:00', endTime: '19:00' },
    ],
    allDaySlot: false,
    editable: false,
    locale: 'es',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    slotEventOverlap: false,
    expandRows: true,
    eventMinHeight: 50,
    contentHeight: 'auto',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay',
    },
    events: [],
    hiddenDays: [0], // Ocultar domingos
    eventMaxStack: undefined, // Sin límite para apilar eventos
    eventClassNames: 'text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 whitespace-normal leading-tight',
    eventDidMount: (info) => {
      // Personalizar contenido de eventos
      const patientName = info.event.extendedProps['patientName'];
      const therapistName = info.event.extendedProps['therapistName'];
      const roomName = info.event.extendedProps['roomName'];

      info.el.innerHTML = `
      <div class="flex flex-col h-auto">
        <span class="font-semibold">Paciente: ${patientName}</span>
        <span>Terapeuta: ${therapistName}</span>
        <span>Sala: ${roomName}</span>
      </div>
    `;
    },
  };

  constructor(private calendarService: CalendarService, private usersService: UsersService, private roomsService: RoomsService, private router: Router) {}

  ngOnInit(): void {
    this.resetFilters();
    this.loadTherapists();
    this.loadRooms();
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.resetFilters();
  }

  resetFilters(): void {
    const today = new Date();
    this.selectedDate = this.formatDateToDDMMYYYY(today);
    this.calendarOptions.initialDate = today.toISOString().split('T')[0];
    this.selectedTherapistId = '';
    this.selectedRoomId = undefined;
  }

  onFilterChange(): void {
    if (!this.selectedRoomId) {
      this.selectedRoomId = undefined;
    }
    this.loadSessions();
  }

  loadSessions(): void {
    if (this.selectedRoomId === undefined && this.selectedDate === '' && this.selectedTherapistId === '') {
      // Caso: Sin ningún filtro -> Cargar sesiones solo por mes
      this.loadMonthlySessions();
    } if (this.selectedDate) {
      // Caso: Filtrar por fecha
      const date = new Date(this.selectedDate);
      this.calendarService.getSessionsByDate(date).subscribe({
        next: (sessions) => {
          if (sessions.length === 0) {
            this.noSessionsModal = true; // Mostrar modal si no hay sesiones
            this.loadMonthlySessions(); // Cargar sesiones por mes como fallback
          } else {
            this.noSessionsModal = false;
            this.updateCalendarEvents(sessions);
            this.jumpToSelectedDate(this.selectedDate);
          }
        },
        error: (err) => {
          console.error('Error al cargar sesiones por fecha:', err);
          if (err.status === 404) {
            this.noSessionsModal = true; // Mostrar modal si la fecha no tiene sesiones
            console.warn(`No se encontraron sesiones para la fecha: ${this.selectedDate}`);
            this.updateCalendarEvents([]); // Limpia el calendario
            this.loadMonthlySessions(); // Cargar sesiones por mes como fallback
          }
        },
      });
    } else if (this.selectedRoomId !== undefined) {
      // Caso: Filtro por sala
      if (this.selectedRoomId === null) {
        this.loadMonthlySessions(); // Si el filtro es "todas las salas", cargar sesiones por mes
      } else {
        this.calendarService.getSessionsByRoom(this.selectedRoomId).subscribe({
          next: (sessions) => {
            if (sessions.length === 0) {
              this.noSessionsModal = true; // Mostrar modal si no hay sesiones
            }
            this.updateCalendarEvents(sessions);
          },
          error: (err) => {
            console.error('Error al cargar sesiones por sala:', err);
            this.noSessionsModal = true; // Mostrar modal si falla la carga
            this.updateCalendarEvents([]); // Limpia el calendario
          },
        });
      }
    } else if (this.selectedTherapistId) {
      // Caso: Filtro por terapeuta
      const therapistId = parseInt(this.selectedTherapistId, 10);
      if (!isNaN(therapistId)) {
        this.calendarService.getSessionsByTherapist(therapistId).subscribe({
          next: (sessions) => this.updateCalendarEvents(sessions),
          error: (err) => console.error('Error al cargar sesiones por terapeuta:', err),
        });
      } else {
        console.warn('El therapistId no es válido:', this.selectedTherapistId);
      }
    } else {
      // Fallback: Si no hay ningún filtro aplicable
      this.loadMonthlySessions();
    }
  }

  private loadMonthlySessions(): void {
    const currentMonthDate = new Date();
    const startDate = currentMonthDate.toISOString().split('T')[0];
    this.calendarService.getSessionsByMonth(startDate).subscribe({
      next: (sessions) => this.updateCalendarEvents(sessions),
      error: (err) => console.error('Error al cargar sesiones del mes:', err),
    });
  }

  private jumpToSelectedDate(date: string): void {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.changeView('timeGridDay', date);
    } else {
      console.error('Referencia al calendario no disponible.');
    }
  }

  private loadRooms(): void {
    this.roomsService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.map(room => ({
          id: room.idRoom ?? undefined,
          name: room.name,
        }));
        console.log('Salas cargadas:', this.rooms);
      },
      error: (err) => console.error('Error al cargar las salas:', err),
    });
  }

  private updateCalendarEvents(sessions: Session[]): void {
    const events = sessions.map((session) => {
      const normalizedStart = session.startTime.trim().replace(/\s+/g, ' '); // Normalizar hora inicio
      const normalizedEnd = session.endTime.trim().replace(/\s+/g, ' ');     // Normalizar hora fin

      return {
        id: session.idSession.toString(),
        start: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedStart)}`,
        end: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedEnd)}`,
        extendedProps: {
          patientName: session.patientName,
          therapistName: session.therapistName,
          roomName: session.roomName,
        },
        backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        textColor: '#ffffff',
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events,
      eventDidMount: (info) => {
        // Crear contenido dinámico
        const patientName = info.event.extendedProps['patientName'];
        const therapistName = info.event.extendedProps['therapistName'];
        const roomName = info.event.extendedProps['roomName'];

        const content = `
        <div class="flex flex-col">
          <span class="font-semibold">Paciente: ${patientName}</span>
          <span>Terapeuta: ${therapistName}</span>
          <span>Sala: ${roomName}</span>
        </div>
      `;

        info.el.innerHTML = content; // Sobrescribe el contenido del evento
      },
    };
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

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

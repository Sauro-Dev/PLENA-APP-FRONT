import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
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
import {HttpParams} from "@angular/common/http";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
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
    hiddenDays: [0],
    datesSet: (dateInfo) => {
      const newDate = dateInfo.start;
      this.selectedDate = this.formatDateForInput(newDate);
      this.onFilterChange(false, false);
      this.cdr.detectChanges();
    },
    views: {
      timeGrid: {
        dayHeaderFormat: {
          weekday: 'short',
          day: 'numeric',
          omitCommas: true
        },
        titleFormat: {
          month: 'long',
          year: 'numeric'
        }
      },
      timeGridWeek: {
        dayHeaderFormat: {
          weekday: 'narrow',
          day: 'numeric',
          omitCommas: true
        },
        titleFormat: {
          month: 'long',
          year: 'numeric'
        }
      },
      timeGridDay: {
        titleFormat: {
          month: 'long',
          year: 'numeric',
          day: 'numeric',
          weekday: 'long'
        }
      }
    },

    dayHeaderContent: (arg) => {
      // Personalizar el formato del encabezado del día
      const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
        .format(arg.date)
        .toUpperCase()
        .replace('.', '');
      const dayNumber = arg.date.getDate();
      return { html: `${dayName} ${dayNumber}` };
    },

    titleFormat: () => {
      const currentDate = new Date();
      const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'short' });
      let month = monthFormat.format(currentDate);
      month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase().replace('.', '');

      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(currentDate.getMonth() + 1);

      if (currentDate.getMonth() !== nextMonth.getMonth()) {
        const nextMonthStr = monthFormat.format(nextMonth).toLowerCase().replace('.', '');
        return `${month} - ${nextMonthStr} ${currentDate.getFullYear()}`;
      }

      return `${month} ${currentDate.getFullYear()}`;
    },

    buttonText: {
      today: 'Hoy',
      week: 'Semana',
      day: 'Día'
    },

  };

  constructor(private calendarService: CalendarService, private usersService: UsersService, private roomsService: RoomsService, private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
    this.loadTherapists();
    this.loadRooms();

    setTimeout(() => {
      this.onFilterChange(false);
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
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
    this.onFilterChange();
  }

  onFilterChange(jumpToDate: boolean = true, showModal: boolean = true): void {
    let params = new HttpParams();

    if (this.selectedDate) {
      params = params.set('date', this.selectedDate);
    }

    if (this.selectedTherapistId && this.selectedTherapistId !== '') {
      params = params.set('therapistId', this.selectedTherapistId);
    }

    if (typeof this.selectedRoomId === 'number') {
      params = params.set('roomId', this.selectedRoomId.toString());
    }

    this.calendarService.getFilteredSessions(params).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.noSessionsModal = showModal && sessions.length === 0;
        this.updateCalendarEvents(sessions);

        if (jumpToDate && this.selectedDate) {
          this.jumpToSelectedDate(this.selectedDate);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar sesiones:', err);
        this.noSessionsModal = showModal;
        this.sessions = [];
        this.updateCalendarEvents([]);
        this.cdr.detectChanges();
      }
    });
  }

  private formatDateToISO(date: string): string {
    if (!date) return '';
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;

    const [day, month, year] = date.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  loadSessions(): void {
    this.calendarService.getSessionsByRoom(this.selectedRoomId).subscribe({
      next: (sessions) => {
        this.noSessionsModal = sessions.length === 0;
        this.updateCalendarEvents(sessions);
      },
      error: (err) => {
        console.error('Error al cargar sesiones:', err);
        this.noSessionsModal = true;
        this.updateCalendarEvents([]);
      },
    });
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
      const currentView = calendarApi.view.type;
      calendarApi.gotoDate(date);
      calendarApi.changeView(currentView);
    }
  }

  private loadRooms(): void {
    this.roomsService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.map(room => ({
          id: room.idRoom ?? undefined,
          name: room.name,
        }));
      },
      error: (err) => console.error('Error al cargar las salas:', err),
    });
  }

  private updateCalendarEvents(sessions: Session[]): void {
    const events = sessions.map((session) => {
      const normalizedStart = session.startTime.trim().replace(/\s+/g, ' ');
      const normalizedEnd = session.endTime.trim().replace(/\s+/g, ' ');

      return {
        title: `Paciente: ${session.patientName}\nTerapeuta: ${session.therapistName}\nSala: ${session.roomName}`,
        start: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedStart)}`,
        end: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedEnd)}`,
        backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
      };
    });

    this.calendarOptions = { ...this.calendarOptions, events };
  }

  loadTherapists(): void {
    this.usersService.getTherapists().subscribe({
      next: (therapists) => {
        this.therapists = therapists.map(therapist => ({
          id: therapist.id,
          name: therapist.name
        }));
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

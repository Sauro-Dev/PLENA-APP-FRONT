import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
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
import esLocale from '@fullcalendar/core/locales/es';
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
    height: 'auto',
    businessHours: [
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '13:00' },
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '15:00', endTime: '19:00' },
    ],
    allDaySlot: false,
    editable: false,
    locale: {
      ...esLocale,
      buttonText: {
        today: 'Hoy',
        week: 'Semana',
        day: 'Día'
      }
    },
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

    dayHeaderContent: (arg) => {
      const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
        .format(arg.date)
        .toUpperCase()
        .replace('.', '');
      const dayNumber = arg.date.getDate();
      return { html: `${dayName} ${dayNumber}` };
    },

    titleFormat: (info) => {
      const start = info.date.marker;
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      const formatMonth = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
          month: 'long'
        }).format(date).replace(' de ', ' ');
      };

      if (start.getMonth() !== end.getMonth()) {
        const startMonth = formatMonth(start);
        const endMonth = formatMonth(end);
        if (start.getFullYear() !== end.getFullYear()) {
          return `${startMonth} ${start.getFullYear()} - ${endMonth} ${end.getFullYear()}`;
        }
        return `${startMonth} - ${endMonth} ${start.getFullYear()}`;
      }

      return `${formatMonth(start)} ${start.getFullYear()}`;
    },

    buttonText: {
      today: 'Hoy',
      week: 'Semana',
      day: 'Día'
    },
  };

  constructor(private calendarService: CalendarService, private usersService: UsersService, private roomsService: RoomsService,
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
        title: `${session.patientName}`,
        start: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedStart)}`,
        end: `${session.sessionDate}T${convertTimeTo24HourFormat(normalizedEnd)}`,
        backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        extendedProps: {
          patientName: session.patientName,
          therapistName: session.therapistName,
          roomName: session.roomName,
          startTime: normalizedStart,
          endTime: normalizedEnd
        } as EventDetails,
        classNames: ['cursor-pointer', 'event-with-time'],
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events,
      eventContent: (arg) => {
        return {
          html: `
            <div class="event-content p-1">
              <div class="font-medium">${arg.event.title}</div>
            </div>
          `
        };
      },
      eventClick: (info) => {
        const props = info.event.extendedProps as EventDetails;
        this.selectedEvent = {
          patientName: props.patientName,
          therapistName: props.therapistName,
          roomName: props.roomName,
          startTime: props.startTime,
          endTime: props.endTime
        };
        this.showEventModal = true;
        this.cdr.detectChanges();
      }
    };
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

  selectedEvent: {
    patientName: string;
    therapistName: string;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null = null;
  showEventModal: boolean = false;
}

interface EventDetails {
  patientName: string;
  therapistName: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

function convertTimeTo24HourFormat(time: string): string {
  const timeRegex = /(\d{1,2}):(\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)/i;
  const match = time.match(timeRegex);

  if (!match) throw new Error(`Formato de hora inválido: ${time}`);

  let [_, hour, minute, meridian] = match;
  let hour24 = parseInt(hour, 10);

  if (meridian.toLowerCase().includes("p") && hour24 < 12) hour24 += 12;
  if (meridian.toLowerCase().includes("a") && hour24 === 12) hour24 = 0;

  return `${hour24.toString().padStart(2, "0")}:${minute}:00`;
}

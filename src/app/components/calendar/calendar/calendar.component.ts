import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CalendarService} from '../calendar.service';
import {Session} from '../session';
import {EventDetails} from "../event-details";
import {FullCalendarComponent, FullCalendarModule} from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, DayHeaderContentArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import {UsersService} from "../../users/users.service";
import {RoomsService} from "../../rooms/rooms.service";
import {HttpParams} from "@angular/common/http";
import esLocale from '@fullcalendar/core/locales/es';
import {Therapist} from "../therapist";
import {Room} from "../room";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    /* Estilos de la barra de herramientas */
    .fc-toolbar-title {
      @apply text-2xl font-bold text-blue-900 capitalize;
    }

    .fc-button {
      @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors !important;
    }

    .fc-button-active {
      @apply bg-blue-800 !important;
    }

    /* Estilos del calendario */
    .fc-col-header-cell {
      @apply bg-blue-50 border-blue-100 !important;
    }

    .day-header {
      @apply p-3 w-full h-full block min-h-[45px] leading-8 hover:bg-blue-100 transition-colors cursor-pointer;
    }

    /* Estilos de eventos */
    .fc-event {
      @apply rounded-lg border-none shadow-sm !important;
      margin: 0 2px !important;
      overflow: hidden !important;
    }

    .event-content {
      @apply flex flex-col h-full p-2 min-h-[80px];
      overflow: hidden !important;
    }

    .event-header {
      @apply text-sm font-medium text-white/90 truncate;
    }

    .event-title {
      @apply text-base font-bold text-white mb-1 truncate;
    }

    .fc-event-main {
      @apply h-full overflow-hidden !important;
    }

    /* Ajustes específicos para eventos múltiples */
    .fc-timegrid-event {
      @apply min-h-[80px] max-h-full !important;
    }

    .fc-event-time {
      @apply hidden;
    }

    /* Estilos de la sección de filtros */
    .filter-section {
      @apply bg-white rounded-xl shadow-md p-6 mb-8;
    }

    .filter-label {
      @apply block text-lg font-medium text-gray-700 mb-2;
    }

    .filter-select {
      @apply w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
    }



    .fc-popover {
      @apply rounded-lg shadow-lg !important;
    }

    .fc-popover-header {
      @apply bg-blue-50 px-4 py-2 flex items-center justify-between !important;
    }

    .fc-popover-title {
      @apply text-sm font-medium text-gray-700 !important;
    }

    .fc-popover-close {
      @apply text-gray-500 hover:text-gray-700 !important;
    }

    .fc-popover-body {
      @apply p-2 !important;
    }

    @media (max-width: 768px) {
      .fc-more-popover {
        max-width: 300px !important;
      }

      .fc-popover-body {
        max-height: 200px !important;
        overflow-y: auto !important;
      }
    }

    .fc-more-link {
      @apply bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium;
    }

    .fc-popover-header {
      @apply bg-blue-50 border-b border-blue-100;
    }



    /* Estilos responsivos */
    @media (max-width: 768px) {
      .fc-timegrid-event {
        @apply min-h-[50px] !important;
      }

      .event-content {
        @apply p-1;
      }

      .event-header {
        @apply text-[10px];
      }

      .event-title {
        @apply text-xs mb-0;
      }

      .fc-timegrid-slot {
        @apply h-16 !important;
      }

      .fc-timegrid-axis {
        @apply w-16 !important;
        min-width: 64px !important;
      }

      .fc-timegrid-slot-label-cushion {
        @apply text-xs;
      }
    }

    /* Ajustes para pantallas muy pequeñas */
    @media (max-width: 480px) {
      .fc-toolbar {
        @apply flex-col gap-2;
      }
    }
  `]
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  handleDateClick = (selectInfo: DateSelectArg) => {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.changeView('timeGridDay', selectInfo.start);
    }
  };

  selectedDate: string = '';
  noSessionsModal: boolean = false;
  selectedTherapistId: string = '';
  therapists: Array<{ id: string; name: string }> = [];
  selectedRoomId: number | undefined;
  rooms: Array<{ idRoom: number | undefined; name: string }> = [];
  sessions: Session[] = [];
  selectedEvent: EventDetails | null = null;
  showEventModal: boolean = false;
  isUpdatingAttendance: boolean = false;
  isRescheduling: boolean = false;
  availableTherapists: Therapist[] = [];
  availableRooms: Room[] = [];

  rescheduleForm = {
    sessionDate: '',
    startTime: '',
    therapistId: '',
    roomId: '',
    reason: ''
  };

  attendanceForm = {
    therapistPresent: false,
    patientPresent: false
  };

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    initialDate: new Date().toISOString().split('T')[0],
    slotMinTime: '09:00:00',
    slotMaxTime: '19:00:00',
    height: 'auto',
    businessHours: [
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '13:00' },
      { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '15:00', endTime: '19:00' },
    ],
    slotEventOverlap: false,
    eventMaxStack: 1,
    dayMaxEvents: 1,
    moreLinkText: '+ {0} más',
    moreLinkClick: 'popover',
    views: {
      timeGrid: {
        dayMaxEvents: 1
      }
    },
    allDaySlot: false,
    editable: false,
    locale: {
      ...esLocale,
      buttonText: {
        today: 'Hoy',
        week: 'Seaman',
        day: 'Día'
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay',
    },
    events: [],
    selectable: true,
    select: undefined,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'narrow',
      omitZeroMinute: true
    },

    slotLabelContent: (arg) => {
      const hour = arg.date.getHours();
      const meridiem = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;

      return {
        html: `
        <div class="flex flex-col items-center justify-center w-full p-2">
          <span class="text-lg font-bold text-gray-700">${hour12}:00</span>
          <span class="text-sm font-medium text-gray-600">${meridiem}</span>
        </div>
      `
      };
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

    dayHeaderContent: (arg: DayHeaderContentArg) => {
      const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
        .format(arg.date)
        .toUpperCase()
        .replace('.', '');
      const dayNumber = arg.date.getDate();
      return {
        html: `
      <div class="day-header cursor-pointer" data-date="${this.formatDateForInput(arg.date)}">
        <div class="w-full h-full flex items-center justify-center">
          ${dayName} ${dayNumber}
        </div>
      </div>
    `
      };
    },

    customButtons: {
      today: {
        text: 'Hoy',
        click: () => {
          const today = new Date();
          this.selectedDate = this.formatDateForInput(today);
          if (this.calendarComponent) {
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.today();
            this.onFilterChange(true);
          }
        }
      }
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

  calendarInitialized = false;

  constructor(
    private calendarService: CalendarService,
    private usersService: UsersService,
    private roomsService: RoomsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
  }

  private loadInitialData(): void {
    this.loadTherapists().then(() => {
      return this.loadRooms();
    }).then(() => {
      this.onFilterChange(false);
    }).catch(error => {
      console.error('Error loading initial data:', error);
    });
  }


  ngAfterViewInit(): void {
    if (this.calendarInitialized) return;

    this.ngZone.runOutsideAngular(() => {
      Promise.all([
        this.loadTherapists(),
        this.loadRooms()
      ]).then(() => {
        this.ngZone.run(() => {
          this.onFilterChange(false);
          this.calendarInitialized = true;

          document.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement;
            const dayHeader = target.closest('.day-header');

            if (dayHeader) {
              const date = dayHeader.getAttribute('data-date');
              if (date && this.calendarComponent) {
                const calendarApi = this.calendarComponent.getApi();
                calendarApi.changeView('timeGridDay', date);
                this.cdr.detectChanges();
              }
            }
          });

          this.cdr.detectChanges();
        });
      });
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.selectedTherapistId = '';
    this.selectedRoomId = undefined;
  }

  resetFilters(): void {
    const today = new Date();
    this.selectedDate = this.formatDateToDDMMYYYY(today);
    this.calendarOptions.initialDate = today.toISOString().split('T')[0];
    this.selectedTherapistId = '';
    this.selectedRoomId = undefined;

    if (this.calendarComponent) {
      this.onFilterChange();
    }
  }

  onFilterChange(jumpToDate: boolean = true, showModal: boolean = true): void {
    let params = new HttpParams();

    if (this.selectedDate) {
      if (this.calendarComponent && this.calendarComponent.getApi()) {
        const view = this.calendarComponent.getApi().view;
        if (view.type === 'timeGridWeek') {
          params = params.set('startDate', this.formatDateForInput(view.activeStart));
          params = params.set('endDate', this.formatDateForInput(view.activeEnd));
        } else {
          params = params.set('date', this.selectedDate);
        }
      } else {
        params = params.set('date', this.selectedDate);
      }
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

  private loadRooms(): Promise<void> {
    return new Promise((resolve) => {
      this.roomsService.getRooms().subscribe({
        next: (rooms) => {
          this.rooms = rooms
            .filter(room => room.isTherapeutic)
            .map(room => ({
              idRoom: room.idRoom,
              name: room.name,
            }));
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar las salas:', err);
          resolve();
        }
      });
    });
  }

  private updateCalendarEvents(sessions: Session[]): void {
    const events = sessions.map((session) => {
      const normalizedStart = session.startTime.trim().replace(/\s+/g, ' ');
      const normalizedEnd = session.endTime.trim().replace(/\s+/g, ' ');

      return {
        title: `${session.patientName}`,
        start: `${session.sessionDate}T${this.convertTimeTo24HourFormat(normalizedStart)}`,
        end: `${session.sessionDate}T${this.convertTimeTo24HourFormat(normalizedEnd)}`,
        backgroundColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        borderColor: session.rescheduled ? '#fbbf24' : '#3b82f6',
        extendedProps: {
          patientName: session.patientName,
          therapistName: session.therapistName,
          roomName: session.roomName,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          sessionDate: session.sessionDate,
          therapistId: session.therapistId,
          sessionId: session.idSession,
          therapistPresent: session.therapistPresent,
          patientPresent: session.patientPresent,
          rescheduled: session.rescheduled,
          reason: session.reason || ''
        } as EventDetails,
        classNames: ['cursor-pointer', 'event-with-time'],
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events,
      eventContent: (arg) => {
        const props = arg.event.extendedProps as EventDetails;
        const isRescheduled = props.rescheduled;

        return {
          html: `
        <div class="event-content">
          <div class="event-header">
            ${props.roomName}
          </div>
          <div class="event-title">
            ${props.patientName}
          </div>
          <div class="event-header mt-auto">
            ${props.therapistName}
          </div>
        </div>
      `
        };
      },
      eventClick: (info) => {
        this.selectedEvent = info.event.extendedProps as EventDetails;
        this.showEventModal = true;
        this.cdr.detectChanges();
      }
    };
  }

  private loadTherapists(): Promise<void> {
    return new Promise((resolve) => {
      this.usersService.getTherapists().subscribe({
        next: (therapists) => {
          this.therapists = therapists.map(therapist => ({
            id: therapist.id,
            name: therapist.name
          }));
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar terapeutas:', err);
          resolve();
        }
      });
    });
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private convertTimeTo24HourFormat(time: string): string {
    const timeRegex = /(\d{1,2}):(\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)/i;
    const match = time.match(timeRegex);

    if (!match) throw new Error(`Formato de hora inválido: ${time}`);

    let [_, hour, minute, meridian] = match;
    let hour24 = parseInt(hour, 10);

    if (meridian.toLowerCase().includes("p") && hour24 < 12) hour24 += 12;
    if (meridian.toLowerCase().includes("a") && hour24 === 12) hour24 = 0;

    return `${hour24.toString().padStart(2, "0")}:${minute}:00`;
  }

  openAttendanceForm(): void {
    if (this.selectedEvent) {
      this.attendanceForm = {
        therapistPresent: this.selectedEvent.therapistPresent,
        patientPresent: this.selectedEvent.patientPresent
      };
      this.isUpdatingAttendance = true;
    }
  }

  saveAttendance(): void {
    if (this.selectedEvent) {
      this.calendarService.presence(
        this.selectedEvent.sessionId,
        this.attendanceForm.therapistPresent,
        this.attendanceForm.patientPresent
      ).subscribe({
        next: () => {
          this.isUpdatingAttendance = false;
          this.onFilterChange(false);
          this.closeModal();
        },
        error: (error: Error) => {
          console.error('Error al marcar asistencia:', error);
        }
      });
    }
  }

  openRescheduleForm(): void {
    if (this.selectedEvent && !this.selectedEvent.therapistPresent && !this.selectedEvent.patientPresent) {
      const [hours, minutes] = this.selectedEvent.startTime.split(':');
      const nextDay = new Date(this.selectedEvent.sessionDate);
      nextDay.setDate(nextDay.getDate() + 1);

      this.rescheduleForm = {
        sessionDate: this.selectedEvent.sessionDate,
        startTime: '',
        therapistId: this.selectedEvent.therapistId.toString(),
        roomId: '',
        reason: ''
      };
      this.loadAvailableResources();
      this.isRescheduling = true;
    }
  }

  getAvailableHours(): string[] {
    if (!this.selectedEvent || !this.rescheduleForm.sessionDate) {
      return [];
    }

    const today = new Date();
    const currentHour = today.getHours();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [year, month, day] = this.rescheduleForm.sessionDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (todayDate.getTime() === selectedDate.getTime()) {
      return this.getAllHours().filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour > currentHour;
      });
    }

    return this.getAllHours();
  }

  private getAllHours(): string[] {
    return [
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00'
    ];
  }


  private convertTo24Hour(time: string): number {
    const cleanTime = time.trim().toLowerCase();
    const isPM = cleanTime.includes('p');
    const [hourStr] = cleanTime.split(':');
    let hour = parseInt(hourStr);

    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }

    return hour;
  }

  loadAvailableResources(): void {
    if (this.rescheduleForm.sessionDate && this.rescheduleForm.startTime) {
      const [hours, minutes] = this.rescheduleForm.startTime.split(':');
      const startTimeDate = new Date(this.rescheduleForm.sessionDate);
      startTimeDate.setHours(parseInt(hours), parseInt(minutes));

      const endTimeDate = new Date(startTimeDate.getTime() + 50 * 60000);

      this.calendarService.getAvailableTherapists(
        this.rescheduleForm.sessionDate,
        startTimeDate.toTimeString().slice(0, 8),
        endTimeDate.toTimeString().slice(0, 8)
      ).subscribe({
        next: (therapists: Therapist[]) => {
          this.availableTherapists = therapists.map((therapist: Therapist) => ({
            id: therapist.id,
            name: therapist.name
          }));
        },
        error: (error: Error) => {
          console.error('Error al cargar terapeutas:', error);
        }
      });

      this.calendarService.getAvailableRooms(
        this.rescheduleForm.sessionDate,
        startTimeDate.toTimeString().slice(0, 8),
        endTimeDate.toTimeString().slice(0, 8)
      ).subscribe({
        next: (rooms: Room[]) => {
          this.availableRooms = rooms.map((room: Room) => ({
            idRoom: room.idRoom,
            name: room.name
          }));
        },
        error: (error: Error) => {
          console.error('Error al cargar salas:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showEventModal = false;
    this.isUpdatingAttendance = false;
    this.isRescheduling = false;
    this.selectedEvent = null;
    this.cdr.detectChanges();
  }

  public canShowRescheduleButton(): boolean {
    if (!this.selectedEvent) return false;
    return !this.selectedEvent.therapistPresent && !this.selectedEvent.patientPresent;
  }

  public saveReschedule(): void {
    if (this.selectedEvent) {
      this.calendarService.reprogramSession(
        this.selectedEvent.sessionId,
        {
          idSession: this.selectedEvent.sessionId,
          sessionDate: this.rescheduleForm.sessionDate,
          startTime: this.rescheduleForm.startTime,
          therapistId: parseInt(this.rescheduleForm.therapistId),
          roomId: parseInt(this.rescheduleForm.roomId),
          reason: this.rescheduleForm.reason
        }
      ).subscribe({
        next: () => {
          this.isRescheduling = false;
          this.onFilterChange(false);
          this.closeModal();
        },
        error: (error: Error) => {
          console.error('Error al reprogramar sesión:', error);
        }
      });
    }
  }

  isValidTime(time: string): boolean {
    if (!time) return false;
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);

    const isMorningHour = hour >= 9 && hour < 13;
    const isAfternoonHour = hour >= 15 && hour < 19;

    return isMorningHour || isAfternoonHour;
  }

  getMinDate(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.formatDateForInput(today);
  }

  get hasValidRescheduleForm(): boolean {
    return !!(
      this.rescheduleForm.sessionDate &&
      this.rescheduleForm.startTime &&
      this.isValidTime(this.rescheduleForm.startTime) &&
      this.rescheduleForm.therapistId &&
      this.rescheduleForm.roomId &&
      this.rescheduleForm.reason
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../rooms.service';
import {DisabledRoomsModalComponent} from "../disabled-rooms-modal/disabled-rooms-modal.component";
import {Material} from "../../storage/material";

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, DisabledRoomsModalComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent implements OnInit {
  rooms: any[] = [];
  filteredRooms: any[] = [];
  searchQuery: string = '';
  therapeuticFilter: string = '';
  itemsPerPage: number = 12;
  currentPage: number = 1;
  paginatedRooms: any[] = [];
  showFilters: boolean = false;
  showDisabledRoomsModal: boolean = false;

  constructor(private roomsService: RoomsService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomsService.getRooms().subscribe((data) => {
      this.rooms = data;
      this.filteredRooms = [...this.rooms];
      this.currentPage = 1;
      this.paginate();
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    if (this.therapeuticFilter === '') {
      this.filteredRooms = [...this.rooms];
    } else {
      const isTherapeutic = this.therapeuticFilter === 'yes';
      this.filteredRooms = this.rooms.filter(room =>
        room.isTherapeutic === isTherapeutic
      );
    }
    this.paginate();
  }

  onSearch(): void {
    this.filteredRooms = this.rooms.filter((room) =>
      room.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * Number(this.itemsPerPage);
    const endIndex = startIndex + Number(this.itemsPerPage);
    this.paginatedRooms = this.filteredRooms.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  openDisabledRoomsModal(): void {
    this.showDisabledRoomsModal = true;
  }

  closeDisabledRoomsModal(): void {
    this.showDisabledRoomsModal = false;
    this.loadRooms();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected readonly Math = Math;
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../rooms.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent implements OnInit {
  rooms: any[] = [];
  filteredRooms: any[] = [];
  searchQuery: string = '';
  therapeuticFilter: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private roomsService: RoomsService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomsService.getRooms().subscribe((data) => {
      this.rooms = data;
      this.filteredRooms = [...this.rooms];
      this.paginate();
    });
  }

  onFilter(): void {
    const isTherapeutic = this.therapeuticFilter === 'yes';
    this.roomsService.getRoomsByTherapeutic(isTherapeutic).subscribe((data) => {
      this.filteredRooms = data;
      this.paginate();
    });
  }

  onSearch(): void {
    this.filteredRooms = this.rooms.filter((room) =>
      room.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredRooms = this.filteredRooms.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  protected readonly Math = Math;
}

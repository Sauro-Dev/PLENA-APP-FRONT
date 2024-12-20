import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AreasService } from '../areas.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css',
})
export class AreasComponent implements OnInit {
  areas: any[] = [];
  showDeleteModal: boolean = false;
  areaToDelete: string | null = null;
  filteredAreas: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchQuery: string = '';
  totalPages: number = 10;

  constructor(private areasService: AreasService, private router: Router) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.areasService.getAreas().subscribe(
      (data) => {
        this.areas = data;
        this.applyFilters();
      },
      (error) => {
        console.error('Error al obtener las áreas de intervención', error);
      }
    );
  }

  applyFilters(): void {
    let filtered = this.areas;
    if (this.searchQuery) {
      filtered = filtered.filter(
        (area) =>
          area.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          area.description
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
      );
    }
    this.filteredAreas = filtered;
    this.totalPages = Math.ceil(this.filteredAreas.length / this.itemsPerPage);
    this.goToPage(1);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  paginate(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  updatePage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredAreas = this.filteredAreas.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePage();
  }

  openDeleteModal(id: string): void {
    this.areaToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.areaToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.areaToDelete) {
      this.areasService.deleteArea(this.areaToDelete).subscribe(
        () => {
          this.showDeleteModal = false;
          this.areaToDelete = null;
          this.loadAreas();
        },
        (error) => {
          console.error('Error al eliminar el área', error);
          this.showDeleteModal = false;
        }
      );
    }
  }

  protected readonly Math = Math;
}

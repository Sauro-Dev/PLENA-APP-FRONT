import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AreasService } from '../areas.service';
import { FormsModule } from '@angular/forms';
import {DisabledInterventionAreasModalComponent} from "../disabled-intervention-areas-modal/disabled-intervention-areas-modal.component";
import {Material} from "../../storage/material";

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, DisabledInterventionAreasModalComponent],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css',
})
export class AreasComponent implements OnInit {
  areas: any[] = [];
  filteredAreas: any[] = [];
  currentPage: number = 1;
  paginatedAreas: any[] = [];
  itemsPerPage: number = 12;
  searchQuery: string = '';
  totalPages: number = 10;
  showFilters: boolean = false;
  showDisabledAreasModal: boolean = false;

  constructor(private areasService: AreasService, private router: Router) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.areasService.getAreas().subscribe(
      (data) => {
        this.areas = data;
        this.filteredAreas = [...this.areas];
        this.applyFilters();
      },
      (error) => {
        console.error('Error al obtener las áreas de intervención', error);
      }
    );
  }

  applyFilters(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredAreas = [...this.areas];
    } else {
      this.filteredAreas = this.areas.filter(
        (area) =>
          area.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          area.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.paginate();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAreas = this.filteredAreas.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    const totalPages = Math.ceil(this.filteredAreas.length / this.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  openDisabledAreasModal(): void {
    this.showDisabledAreasModal = true;
  }

  closeDisabledAreasModal(): void {
    this.showDisabledAreasModal = false;
    this.loadAreas();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected readonly Math = Math;
}

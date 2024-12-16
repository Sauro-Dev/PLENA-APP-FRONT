import { Component, OnInit } from '@angular/core';
import { RouterLink} from "@angular/router";
import {UsersService} from "../users.service";
import {CommonModule} from "@angular/common";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users-details.component.html',
  styleUrl: './users-details.component.css'
})
export class UsersDetailsComponent implements OnInit {
  user: any;

  constructor(private usersService: UsersService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    this.loadUserDetails(userId);
  }

  loadUserDetails(userId: string | null): void {
    if (userId) {
      this.usersService.getUserDetails(+userId).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          console.error('Error fetching user details', error);
        }
      );
    }
  }
}

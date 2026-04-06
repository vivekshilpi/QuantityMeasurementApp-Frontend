import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get userName(): string {
    const user = this.authService.currentUser;
    return user?.fullName || user?.name || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

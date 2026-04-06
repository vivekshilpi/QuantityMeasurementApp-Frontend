import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef;

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkApiStatus();
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private checkApiStatus(): void {
    this.authService.checkStatus().subscribe({
      error: () => {
        this.errorMessage = 'Unable to connect to the server. Please try again later.';
      }
    });
  }

  private initGoogleSignIn(): void {
    setTimeout(() => {
      if (this.googleBtn?.nativeElement) {
        this.authService.initializeGoogleSignIn(
          this.googleBtn.nativeElement,
          this.handleGoogleResponse.bind(this)
        );
      }
    }, 100);
  }

  private handleGoogleResponse(response: any): void {
    if (response.credential) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.googleLogin(response.credential).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Google sign-in failed. Please try again.';
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}

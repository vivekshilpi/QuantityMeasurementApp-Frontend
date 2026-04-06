import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef;

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  passwordValidation: PasswordValidation = {
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false
  };

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

  onPasswordChange(): void {
    this.passwordValidation = {
      minLength: this.password.length >= 8,
      hasUppercase: /[A-Z]/.test(this.password),
      hasNumber: /[0-9]/.test(this.password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(this.password)
    };
  }

  get isPasswordValid(): boolean {
    return Object.values(this.passwordValidation).every(Boolean);
  }

  get passwordStrength(): number {
    return Object.values(this.passwordValidation).filter(Boolean).length;
  }

  get strengthClass(): string {
    if (this.passwordStrength <= 1) return 'weak';
    if (this.passwordStrength <= 2) return 'fair';
    if (this.passwordStrength <= 3) return 'good';
    return 'strong';
  }

  get strengthText(): string {
    if (this.passwordStrength <= 1) return 'Weak';
    if (this.passwordStrength <= 2) return 'Fair';
    if (this.passwordStrength <= 3) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isPasswordValid) {
      this.errorMessage = 'Password does not meet the requirements.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}

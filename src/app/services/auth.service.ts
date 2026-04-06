import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest, GoogleLoginRequest } from '../models';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    const request: GoogleLoginRequest = { token: idToken };
    return this.http.post<AuthResponse>(`${this.API_URL}/google-login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  checkStatus(): Observable<any> {
    return this.http.get(`${this.API_URL}/status`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`);
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);

      const user: User = response.user || {
        fullName: response.fullName || '',
        email: response.email || ''
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  initializeGoogleSignIn(buttonElement: HTMLElement, callback: (response: any) => void): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: callback
      });

      buttonElement.innerHTML = '';

      const width = Math.floor(
        buttonElement.getBoundingClientRect().width ||
        buttonElement.parentElement?.getBoundingClientRect().width ||
        320
      );

      google.accounts.id.renderButton(buttonElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: `${Math.max(280, Math.min(400, width))}`
      });

      requestAnimationFrame(() => {
        const wrapper = buttonElement.firstElementChild as HTMLElement | null;
        if (wrapper) {
          wrapper.style.margin = '0 auto';
          wrapper.style.display = 'table';
        }
      });
    }
  }
}

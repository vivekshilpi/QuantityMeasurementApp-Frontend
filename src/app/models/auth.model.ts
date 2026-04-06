export interface User {
  fullName: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  fullName?: string;
  email?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  token: string;
}

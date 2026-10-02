import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = computed(() => !!this.currentUser());

  private isBrowser(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) return null;
    const userData = localStorage.getItem(this.userKey);
    if (!userData) return null;
    try {
      return JSON.parse(userData) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  login(emailOrUsername: string, password: string) {
    return this.http.post<{ access_token: string, user: User }>(`${this.apiUrl}/auth/login`, { emailOrUsername, password })
      .pipe(
        tap(response => {
          if (this.isBrowser()) {
            localStorage.setItem(this.tokenKey, response.access_token);
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
          }
          this.currentUser.set(response.user);
        })
      );
  }

  register(name: string, email: string, username: string, password: string) {
    return this.http.post<{ user: User; access_token: string }>(`${this.apiUrl}/auth/register`, { name, email, username, password });
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ image: string }>(`${this.apiUrl}/auth/avatar`, formData)
      .pipe(
        tap(response => {
          const user = this.currentUser();
          if (user) {
            user.image = response.image;
            if (this.isBrowser()) {
              localStorage.setItem(this.userKey, JSON.stringify(user));
            }
            this.currentUser.set({ ...user });
          }
        })
      );
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    return this.currentUser();
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUser.set(null);
  }

  updateUser(user: User) {
    if (this.isBrowser()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  checkUsername(username: string) {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/auth/check-username/${username}`);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }
}

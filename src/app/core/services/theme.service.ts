import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Theme } from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  updateTheme(theme: Partial<Theme>): Observable<Theme> {
    return this.http.patch<Theme>(`${this.apiUrl}/auth/theme`, theme);
  }
}

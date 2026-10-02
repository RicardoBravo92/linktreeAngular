import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Link } from '../models/link.model';
import { User } from '../models/user.model';

interface AnalyticsData {
  totalClicks: number;
  links: Link[];
}

interface CreateLinkBody {
  title: string;
  url: string;
  platform?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LinksService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMyLinks(): Observable<Link[]> {
    return this.http.get<Link[]>(`${this.apiUrl}/links/my-links`);
  }

  getLinksByUsername(username: string): Observable<{ user: User, links: Link[] }> {
    return this.http.get<{ user: User, links: Link[] }>(`${this.apiUrl}/links/user/${username}`);
  }

  createLink(title: string, url: string, platform?: string, description?: string): Observable<Link> {
    const body: CreateLinkBody = { title, url };
    if (platform) body.platform = platform;
    if (description) body.description = description;
    return this.http.post<Link>(`${this.apiUrl}/links`, body);
  }

  updateLink(id: number, title: string, url: string, platform?: string, description?: string): Observable<Link> {
    const body: CreateLinkBody = { title, url };
    if (platform) body.platform = platform;
    if (description) body.description = description;
    return this.http.patch<Link>(`${this.apiUrl}/links/${id}`, body);
  }

  deleteLink(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/links/${id}`);
  }

  reorder(links: { id: number; order: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/links/reorder`, { links });
  }

  trackClick(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/links/${id}/click`, {});
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/links/analytics`);
  }
}

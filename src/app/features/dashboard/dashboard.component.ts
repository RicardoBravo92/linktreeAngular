import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LinksService } from '../../core/services/links.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Link } from '../../core/models/link.model';
import { Theme } from '../../core/models/theme.model';
import { THEME_GRADIENTS, THEME_BUTTON_STYLES, THEME_FONTS, DEFAULT_THEME } from '../../core/config/theme.config';

interface AnalyticsData {
  totalClicks: number;
  links: Link[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  links = signal<Link[]>([]);
  editMode = signal(false);
  editLinkId = signal<number | null>(null);
  urlError = signal('');
  user = computed(() => this.authService.currentUser());

  showShare = signal(false);
  shareUrl = computed(() => {
    const u = this.user();
    return u ? `${window.location.origin}/${u.username}` : '';
  });
  qrCodeUrl = signal('');

  activeTab = signal<'links' | 'analytics' | 'theme'>('links');
  analytics = signal<AnalyticsData | null>(null);

  platforms = ['', 'Instagram', 'Twitter/X', 'YouTube', 'TikTok', 'LinkedIn', 'GitHub', 'Twitch', 'Discord', 'Facebook', 'Pinterest'];

  customLinks = computed(() => this.links().filter(l => !l.platform));
  socialLinks = computed(() => this.links().filter(l => !!l.platform));

  // Shared theme constants (single source of truth)
  gradients = THEME_GRADIENTS;
  buttonStyles = THEME_BUTTON_STYLES;
  fonts = THEME_FONTS;

  theme = signal<Theme>(DEFAULT_THEME);

  linkForm = new FormGroup({
    url: new FormControl('', { nonNullable: true }),
    platform: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  themeFontControl = new FormControl('Inter', { nonNullable: true });

  private linksService = inject(LinksService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private editingOriginalTitle = '';

  ngOnInit() {
    this.loadLinks();
    this.loadAnalytics();
    const u = this.user();
    if (u) {
      this.theme.set({
        bgColor: u.bgColor || '#6C63FF',
        bgGradient: u.bgGradient || 'from-indigo-500 to-purple-600',
        buttonStyle: u.buttonStyle || 'rounded',
        fontFamily: u.fontFamily || 'Inter',
      });
      this.themeFontControl.setValue(u.fontFamily || 'Inter');
    }
  }

  loadLinks() {
    this.linksService.getMyLinks().subscribe({
      next: (data) => { this.links.set(data); }
    });
  }

  loadAnalytics() {
    this.linksService.getAnalytics().subscribe({
      next: (data) => { this.analytics.set(data); }
    });
  }

  isValidUrl(url: string): boolean {
    try { new URL(url); return true; } catch { return false; }
  }

  validateUrl() {
    this.urlError.set('');
    const url = this.linkForm.controls.url.value;
    if (url && !this.isValidUrl(url)) {
      this.urlError.set('Enter a valid URL (e.g., https://example.com)');
    }
  }

  addLink() {
    this.validateUrl();
    const url = this.linkForm.controls.url.value;
    const platform = this.linkForm.controls.platform.value || undefined;
    const description = this.linkForm.controls.description.value || undefined;
    if (this.urlError() || !url) return;
    const title = platform || new URL(url).hostname.replace('www.', '');
    this.linksService.createLink(title, url, platform, description).subscribe({
      next: () => {
        this.linkForm.reset({ url: '', platform: '', description: '' });
        this.loadLinks();
        this.loadAnalytics();
      }
    });
  }

  editLink(link: Link) {
    this.editMode.set(true);
    this.editLinkId.set(link.id);
    this.editingOriginalTitle = link.title;
    this.linkForm.patchValue({
      url: link.url,
      platform: link.platform || '',
      description: link.description || '',
    });
    this.urlError.set('');
  }

  updateLink() {
    this.validateUrl();
    const url = this.linkForm.controls.url.value;
    const platform = this.linkForm.controls.platform.value || undefined;
    const description = this.linkForm.controls.description.value || undefined;
    const id = this.editLinkId();
    if (this.urlError() || !url) return;
    const title = platform || this.editingOriginalTitle || new URL(url).hostname.replace('www.', '');
    if (id !== null) {
      this.linksService.updateLink(id, title, url, platform, description).subscribe({
        next: () => { this.cancelEdit(); this.loadLinks(); }
      });
    }
  }

  cancelEdit() {
    this.editMode.set(false);
    this.editLinkId.set(null);
    this.editingOriginalTitle = '';
    this.linkForm.reset({ url: '', platform: '', description: '' });
    this.urlError.set('');
  }

  deleteLink(id: number) {
    this.linksService.deleteLink(id).subscribe({
      next: () => { this.loadLinks(); this.loadAnalytics(); }
    });
  }

  drop(event: CdkDragDrop<Link[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const previousLinks = this.links();
    const customs = [...this.customLinks()];
    moveItemInArray(customs, event.previousIndex, event.currentIndex);

    const updated = previousLinks.map(link => {
      if (link.platform) return link;
      const next = customs.shift();
      return next ?? link;
    });

    this.links.set(updated);
    const reordered = updated.map((link, index) => ({ id: link.id, order: index }));
    this.linksService.reorder(reordered).subscribe({
      error: () => {
        this.links.set(previousLinks);
      }
    });
  }

  copyLink() {
    navigator.clipboard.writeText(this.shareUrl());
    alert('Link copied to clipboard!');
  }

  generateQR() {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(this.shareUrl(), { width: 256, margin: 2 }, (err: unknown, url: string) => {
        if (!err) this.qrCodeUrl.set(url);
      });
    });
  }

  toggleShare() {
    this.showShare.update(v => !v);
    if (this.showShare() && !this.qrCodeUrl()) {
      this.generateQR();
    }
  }

  downloadQR() {
    const a = document.createElement('a');
    a.href = this.qrCodeUrl();
    const u = this.user();
    a.download = `linktree-${u?.username || 'profile'}-qr.png`;
    a.click();
  }

  setActiveTab(tab: 'links' | 'analytics' | 'theme') {
    this.activeTab.set(tab);
    if (tab === 'analytics') this.loadAnalytics();
  }

  updateThemeProperty(key: string, value: string) {
    this.theme.update(t => ({ ...t, [key]: value }));
  }

  onThemeFontChange(value: string) {
    this.updateThemeProperty('fontFamily', value);
  }

  saveTheme() {
    this.themeService.updateTheme(this.theme()).subscribe({
      next: (response) => {
        const u = this.user();
        if (u) {
          this.authService.updateUser({ ...u, ...response });
        }
        alert('Theme saved');
      }
    });
  }
}

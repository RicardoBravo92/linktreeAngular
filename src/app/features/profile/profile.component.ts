import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Theme } from '../../core/models/theme.model';
import { User } from '../../core/models/user.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  selectedFile = signal<File | null>(null);
  editMode = signal(false);
  error = signal('');
  usernameAvailable = signal<boolean | null>(null);
  usernameChecking = signal(false);

  activeTab = signal<'profile' | 'theme'>('profile');

  theme = signal<Theme>({ bgColor: '#6C63FF', bgGradient: 'from-indigo-500 to-purple-600', buttonStyle: 'rounded', fontFamily: 'Inter' });
  gradients = [
    { label: 'Indigo to Purple', value: 'from-indigo-500 to-purple-600' },
    { label: 'Pink to Orange', value: 'from-pink-500 to-orange-400' },
    { label: 'Teal to Blue', value: 'from-teal-500 to-blue-600' },
    { label: 'Green to Teal', value: 'from-green-500 to-teal-400' },
    { label: 'Red to Pink', value: 'from-red-500 to-pink-500' },
    { label: 'Dark', value: 'from-gray-800 to-gray-900' },
    { label: 'Sunset', value: 'from-orange-500 to-red-500' },
    { label: 'Ocean', value: 'from-blue-500 to-cyan-400' },
  ];
  buttonStyles = [
    { label: 'Rounded', value: 'rounded' },
    { label: 'Pill', value: 'pill' },
    { label: 'Square', value: 'square' },
  ];
  fonts = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'Montserrat', value: 'Montserrat' },
  ];

  profileForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    username: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  themeFontControl = new FormControl('Inter', { nonNullable: true });

  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private http = inject(HttpClient);
  private usernameSearch$ = new Subject<string>();

  ngOnInit() {
    const u = this.user();
    this.profileForm.patchValue({
      name: u?.name || '',
      email: u?.email || '',
      username: u?.username || '',
      description: u?.description || '',
    });
    if (u) {
      this.theme.set({
        bgColor: u.bgColor || '#6C63FF',
        bgGradient: u.bgGradient || 'from-indigo-500 to-purple-600',
        buttonStyle: u.buttonStyle || 'rounded',
        fontFamily: u.fontFamily || 'Inter',
      });
      this.themeFontControl.setValue(u.fontFamily || 'Inter');
    }

    this.usernameSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(username => {
        if (!username || username.length < 3) {
          this.usernameAvailable.set(null);
          this.usernameChecking.set(false);
          return of(null);
        }
        this.usernameChecking.set(true);
        return this.authService.checkUsername(username).pipe(
          catchError(() => {
            this.usernameAvailable.set(null);
            this.usernameChecking.set(false);
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      if (result) {
        this.usernameAvailable.set(result.available);
        this.usernameChecking.set(false);
      }
    });

    this.profileForm.controls.username.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const currentUsername = this.user()?.username;
      if (value === currentUsername) {
        this.usernameAvailable.set(null);
        this.usernameChecking.set(false);
        return;
      }
      if (value.length < 3) {
        this.usernameAvailable.set(null);
        this.usernameChecking.set(false);
      }
      this.usernameSearch$.next(value);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  uploadAvatar() {
    const file = this.selectedFile();
    if (file) {
      this.authService.uploadAvatar(file).subscribe({
        next: () => { alert('Avatar updated'); }
      });
    }
  }

  toggleEdit() {
    this.editMode.update(v => !v);
    this.error.set('');
    this.usernameAvailable.set(null);
    this.usernameChecking.set(false);
    if (this.editMode()) {
      const u = this.user();
      this.profileForm.patchValue({
        name: u?.name || '',
        email: u?.email || '',
        username: u?.username || '',
        description: u?.description || '',
      });
    }
  }

  saveProfile() {
    const currentUsername = this.user()?.username;
    const newUsername = this.profileForm.controls.username.value;
    if (newUsername !== currentUsername && this.usernameAvailable() === false) {
      this.error.set('Username is already taken');
      return;
    }

    this.http.patch<User>(`${environment.apiUrl}/auth/profile`, this.profileForm.getRawValue()).subscribe({
      next: (response) => {
        this.authService.updateUser(response);
        this.editMode.set(false);
        this.error.set('');
        this.usernameAvailable.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error updating profile');
      }
    });
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
        alert('Theme updated');
      }
    });
  }

  viewPublicProfile() {
    const u = this.user();
    if (u?.username) {
      window.open(`/${u.username}`, '_blank');
    }
  }

  setActiveTab(tab: 'profile' | 'theme') {
    this.activeTab.set(tab);
  }
}

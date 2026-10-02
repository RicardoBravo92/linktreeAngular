import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  error = signal('');
  usernameAvailable = signal<boolean | null>(null);
  usernameChecking = signal(false);

  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private usernameSearch$ = new Subject<string>();

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() {
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

    this.form.controls.username.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      if (value.length < 3) {
        this.usernameAvailable.set(null);
        this.usernameChecking.set(false);
      }
      this.usernameSearch$.next(value);
    });
  }

  onSubmit() {
    const { name, email, username, password } = this.form.getRawValue();
    this.authService.register(name, email, username, password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error.set(err.error.message || 'Registration failed');
      }
    });
  }
}

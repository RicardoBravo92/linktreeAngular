import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  error = signal('');
  submitted = signal(false);

  private authService = inject(AuthService);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  onSubmit() {
    const { email } = this.form.getRawValue();
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.submitted.set(true);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to send reset email. Please try again.');
      }
    });
  }
}

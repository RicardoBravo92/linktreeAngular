import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  error = signal('');
  success = signal(false);
  invalidToken = signal(false);

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  private token = '';

  form = new FormGroup(
    {
      newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: this.passwordsMatch }
  );

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.invalidToken.set(true);
    }
  }

  private passwordsMatch(control: AbstractControl): { mismatch: boolean } | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }
  onSubmit() {
    const { newPassword } = this.form.getRawValue();
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.success.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to reset password. Please try again.');
      }
    });
  }
}

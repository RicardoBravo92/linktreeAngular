import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailComponent implements OnInit {
  error = signal('');
  success = signal(false);
  verifying = signal(true);
  invalidToken = signal(false);

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.verifying.set(false);
      this.invalidToken.set(true);
      return;
    }
    this.verify();
  }

  private verify() {
    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.verifying.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.verifying.set(false);
        this.error.set(err?.error?.message || 'Unable to verify email. Please try again.');
      }
    });
  }
}
import { Component, inject, signal } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private service = inject(BudgetService);
  private router = inject(Router);

  username: string = '';
  email: string = '';
  password: string = '';
  confirmation: string = '';
  error = signal<string | null>(null);
  registerUser() {
    if (!this.username || !this.email || !this.password) {
      this.error.set('All fields are required');
      return;
    }
    if (this.password !== this.confirmation) {
      this.error.set('Passwords do not match');
      return;
    }

    this.service
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (user) => {
          this.router.navigate(['/login']); // or auto-login
        },
        error: (err: HttpErrorResponse) => {
          const errorMessage =
            err.error?.Message ||
            err.error ||
            'Registration failed.  Please try again.';
          console.error('Registration failed', err);
          this.error.set(errorMessage);
        },
      });
  }
}

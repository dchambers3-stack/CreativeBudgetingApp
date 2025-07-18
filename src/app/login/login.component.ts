import { Component, inject, signal } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage = signal<string>('');
  get isLoggedIn(): boolean {
    return this.loginService.userId() !== null;
  }

  private loginService = inject(LoginService);
  private router = inject(Router);

  async login(): Promise<void> {
    try {
      await this.loginService.login(this.username, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set('Invalid username or password');
      setTimeout(() => {
        this.errorMessage.set('');
      }, 5000);
    }
  }
}

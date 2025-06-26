import { Component, inject } from '@angular/core';
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
  errorMessage: string = '';

  private loginService = inject(LoginService);
  private router = inject(Router);

  async login() {
    await this.loginService.login(this.username, this.password);
    this.router.navigate(['/dashboard']);
  }
}

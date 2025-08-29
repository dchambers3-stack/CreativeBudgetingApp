import { Component, inject, signal } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../components/language-selector.component';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslatePipe, LanguageSelectorComponent],
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
  private i18nService = inject(I18nService);

  async login(): Promise<void> {
    try {
      await this.loginService.login(this.username, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(this.i18nService.translate('auth.login.error'));
      setTimeout(() => {
        this.errorMessage.set('');
      }, 5000);
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}

import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from './login.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserProfileComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  title = 'budget-angular-app';
  private service = inject(LoginService);
  private router = inject(Router);
  isDarkMode = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  logout() {
    this.service.logout();
    this.router.navigate(['/']);
  }
  get isLoggedIn(): boolean {
    return this.service.userId() !== null;
  }
  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }
  navigateToExpenses(): void {
    this.router.navigate(['/add-expenses']);
  }
  navigateToHowtoBudget(): void {
    this.router.navigate(['/how-to-budget']);
  }
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  navigateToPaycheck(): void {
    this.router.navigate(['/paychecks']);
  }
  navigateToRecurringExpenses(): void {
    this.router.navigate(['/recurring-expenses']);
  }
  navigateToCreateTicket(): void {
    this.router.navigate(['/create-ticket']);
  }
}

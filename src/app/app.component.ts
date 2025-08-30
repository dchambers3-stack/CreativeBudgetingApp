import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';
import { BudgetService } from './services/budget.service';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LogoComponent } from './components/logo.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserProfileComponent, LogoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'budget-angular-app';
  private service = inject(LoginService);
  private budgetService = inject(BudgetService);
  private router = inject(Router);
  isDarkMode = false;

  // Profile picture modal properties
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  currentUserId = this.service.userId();

  ngOnInit() {
    // Listen for modal open events from user-profile component
    document.addEventListener('openProfileModal', () => {
      this.openProfileModal();
    });
  }

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
  navigateToMyTickets(): void {
    this.router.navigate(['/tickets']);
  }

  // Profile picture modal methods
  openProfileModal(): void {
    const modalElement = document.getElementById('profilePictureModal');
    if (modalElement) {
      // Use Bootstrap's modal API
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProfilePicture(): Promise<void> {
    if (this.selectedFile && this.service.userId()) {
      try {
        await this.budgetService.uploadProfilePicture(
          this.service.userId()!,
          this.selectedFile
        );
        console.log('Profile picture uploaded successfully');

        // Close modal
        const modalElement = document.getElementById('profilePictureModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(
            modalElement
          );
          modal?.hide();
        }

        // Reset form
        this.selectedFile = null;
        this.previewUrl = null;

        // Trigger refresh of profile picture in navbar
        window.location.reload();
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  }
}

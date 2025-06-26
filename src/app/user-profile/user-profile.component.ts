import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { BudgetService } from '../budget.service';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private budgetService = inject(BudgetService);
  private userService = inject(LoginService);
  profileImageUrl = signal<string | null>(null);
  
  currentUser = this.userService.userId();
  selectedFile: File | null = null;
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    // Clean up the object URL to prevent memory leaks
    const currentUrl = this.profileImageUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
  }

  async loadProfilePicture(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Clean up previous URL if it exists
      const currentUrl = this.profileImageUrl();
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      
      const blob = await this.budgetService.getProfilePicture(this.currentUser ?? 0);
      const imageUrl = URL.createObjectURL(blob);
      this.profileImageUrl.set(imageUrl);
    } catch (error) {
      console.error('Error loading profile picture:', error);
      // If no profile picture exists, the signal will remain null
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async uploadProfilePic(): Promise<void> {
    if (this.selectedFile) {
      try {
        this.isLoading.set(true);
        await this.budgetService.uploadProfilePicture(this.currentUser ?? 0, this.selectedFile);
        
        // Reload the profile picture after successful upload
        await this.loadProfilePicture();
        
        // Reset the file selection
        this.selectedFile = null;
        
        // Reset the file input
        const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}

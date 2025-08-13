import { Component, computed, inject, output } from '@angular/core';
import { LoginService } from '../services/login.service';
import { BudgetService } from '../services/budget.service';
import { AddPersonalInfoDto } from '../../models/add-personal-info.type';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pay-details',
  imports: [FormsModule],
  templateUrl: './pay-details.component.html',
  styleUrl: './pay-details.component.css',
})
export class PayDetailsComponent {
  private loginService = inject(LoginService);
  private budgetService = inject(BudgetService);
  private router = inject(Router);
  personalInfo: AddPersonalInfoDto = {};
  personalData = output<AddPersonalInfoDto>();
  currentUserId = computed(() => this.loginService.userId());

  addPersonalInfo() {
    if (this.currentUserId() !== null) {
      this.budgetService
        .addPersonalInfo(this.currentUserId() ?? 0, this.personalInfo)
        .subscribe({
          next: (data) => {
            this.router.navigate(['/dashboard']);
            this.personalData.emit; // Navigate to the dashboard after adding personal info
          },
          error: (error) => {
            console.error('Error adding personal info', error);
          },
        });
    }
  }
}

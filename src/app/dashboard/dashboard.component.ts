import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { BudgetService } from '../services/budget.service';
import { DashboardDto } from '../../models/dashboard-dto.type';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AddPersonalInfoDto } from '../../models/add-personal-info.type';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaycheckService } from '../services/paycheck.service';
import { Paycheck } from '../../models/paycheck.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { MarkExpenseAsPaidDto } from '../../models/mark-expense-as-paid.type';
import { SavingsDto } from '../../models/savings-dto.type';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private formBuilder = inject(FormBuilder);
  private paycheckService = inject(PaycheckService);
  private budgetService = inject(BudgetService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private deleteExpenseId: number | null = null;
  private deletePaycheckIdTemp: number | null = null;
  selectedExpense: any = null;
  dashboardData = signal<DashboardDto | null>(null);
  personalInfo = signal<AddPersonalInfoDto | null>(null);
  modalPayAmount: number | null = null;
  modalPaycheckId: number | null = null;
  showAlert = signal<boolean>(false);
  private userId = this.loginService.userId();
  currentMonthName = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  openEditModal(paycheckId: number) {
    const paychecks = this.paychecksInfo.value();
    const selected = paychecks?.find((p) => p.id === paycheckId);
    if (selected) {
      this.modalPayAmount = selected.amount;
      this.modalPaycheckId = paycheckId;
    }
  }

  dashboardInfo = resource({
    loader: () =>
      this.budgetService.getDashboardInfo(this.loginService.userId()!),
  });

  paychecksInfo = resource({
    request: () => this.loginService.userId() ?? 0,
    loader: ({ request }) => {
      if (request) {
        return this.paycheckService.getPaychecksForBudget(request);
      } else {
        return Promise.resolve([]);
      }
    },
  });

  constructor() {
    // Get current month name
    const today = new Date();
    this.currentMonthName.set(
      today.toLocaleString('default', { month: 'long' })
    );

    // Additional effect to handle when allBudgetPeriods loads
    effect(() => {
      const allPeriods = this.allBudgetPeriods.value();
      if (
        allPeriods &&
        allPeriods.length > 0 &&
        (!this.selectedBudgetPeriodId() || this.selectedBudgetPeriodId() === 0)
      ) {
        this.selectedBudgetPeriodId.set(allPeriods[0].id);
      }
    });
  }

  readonly totalIncome = computed(() => {
    const paychecks = this.paychecksInfo.value();
    return paychecks?.reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  expenses = resource({
    request: () => this.userId ?? 0,
    loader: ({ request }) => this.budgetService.getExpenses(request),
  });

  readonly totalExpenses = computed(() => {
    const expenses = this.expenses.value();
    return expenses?.reduce((sum, e) => sum + (e.payment || 0), 0) || 0;
  });

  readonly remainingBudget = computed(
    () => (this.totalIncome() || 0) - (this.totalExpenses() || 0)
  );

  readonly totalPaidExpenses = computed(() => {
    const expenses = this.expenses.value();
    return (
      expenses?.reduce((sum, e) => sum + (e.isPaid ? e.payment || 0 : 0), 0) ||
      0
    );
  });

  readonly totalUnpaidExpenses = computed(() => {
    const expenses = this.expenses.value();
    return (
      expenses?.reduce((sum, e) => sum + (!e.isPaid ? e.payment || 0 : 0), 0) ||
      0
    );
  });

  async editPay(): Promise<void> {
    try {
      if (this.modalPaycheckId) {
        const paychecks = this.paychecksInfo.value();
        const paycheckToUpdate = paychecks?.find(
          (p) => p.id === this.modalPaycheckId
        );
        if (paycheckToUpdate) {
          paycheckToUpdate.amount = this.modalPayAmount || 0;
          await this.paycheckService.updatePaycheck(
            this.modalPaycheckId,
            paycheckToUpdate
          );
        }
      }
    } catch (error) {
      console.error('Error updating paycheck', error);
    } finally {
      this.paychecksInfo.reload();
      this.modalPaycheckId = null;
    }
  }

  navigateToPersonalInfo() {
    this.router.navigate(['/pay-info']);
  }
  navigateToPaycheck() {
    this.router.navigate(['/paychecks']);
  }
  navigateToAddExpenses() {
    this.router.navigate(['/add-expenses']);
  }
  openDeletePaycheckModal(paycheckId: number) {
    this.deletePaycheckIdTemp = paycheckId;
    // Open the modal
    const deletePaycheckModal = new bootstrap.Modal(
      document.getElementById('deletePaycheckModal')!
    );
    deletePaycheckModal.show();
  }

  openDeleteExpenseModal(expenseId: number) {
    this.deleteExpenseId = expenseId;
    const expenses = this.expenses.value();
    this.selectedExpense = expenses?.find((e) => e.id === expenseId);

    const deleteExpenseModal = new bootstrap.Modal(
      document.getElementById('deleteExpenseModal')!
    );
    deleteExpenseModal.show();
  }

  async deletePaycheckConfirm(): Promise<void> {
    try {
      if (this.deletePaycheckIdTemp !== null) {
        await this.paycheckService.deletePaycheck(this.deletePaycheckIdTemp);
      }
    } catch (error) {
      console.error('Error deleting paycheck', error);
    } finally {
      this.paychecksInfo.reload();
    }
  }

  deleteExpenseConfirm() {
    if (this.deleteExpenseId !== null) {
      this.budgetService.deleteExpenses(this.deleteExpenseId).subscribe({
        next: (data) => {
          this.expenses.reload();
          this.selectedExpense = null;
          this.deleteExpenseId = null;
        },
        error: (error) => {
          console.error('Error deleting expense', error);
        },
      });
    }
  }
  async markExpenseAsPaid(expenseId: number): Promise<void> {
    try {
      const dto: MarkExpenseAsPaidDto = { isPaid: true };
      await this.budgetService.markExpenseAsPaid(expenseId, dto);
    } catch (error) {
      console.error('Error marking expense as paid:', error);
    } finally {
      this.expenses.reload();
    }
  }

  handleDeletePaycheck(paycheck: any) {
    this.openDeletePaycheckModal(paycheck.id);
  }

  showExpenseWarningAlert() {
    this.showAlert.set(true);
    setTimeout(() => {
      this.showAlert.set(false);
    }, 8000);
  }

  async createNewBudgetPeriod(): Promise<void> {
    try {
      const result = await this.budgetService.startNewBudgetPeriod(
        this.userId ?? 0
      );

      // Set the newly created budget period as selected
      if (result.budgetId) {
        this.selectedBudgetPeriodId.set(result.budgetId);
      }
    } catch (err) {
      console.error('Error creating new budget period:', err);
    } finally {
      this.allBudgetPeriods.reload();
    }
  }

  allBudgetPeriods = resource({
    request: () => this.userId ?? 0,
    loader: ({ request }) => this.budgetService.getAllBudgetPeriods(request),
  });

  // Selected budget period ID
  selectedBudgetPeriodId = signal<number | null>(null);

  onBudgetPeriodChange(newValue: number) {
    if (newValue && newValue > 0) {
      this.selectedBudgetPeriodId.set(newValue);
      this.paychecksInfo.reload();
    } else {
      console.warn('Invalid budget period ID:', newValue);
    }
  }

  savings = resource({
    request: () => this.loginService.userId() ?? 0,
    loader: ({ request }) => this.budgetService.getSavingsAmount(request),
  });

  savingsAmount = this.formBuilder.group({
    amount: [null, Validators.required],
  });

  deductSavingsAmount = this.formBuilder.group({
    amount: [null, Validators.required],
  });

  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    if (this.savingsAmount.valid) {
      const amount = this.savingsAmount.get('amount')
        ?.value as unknown as number;
      const userId = this.loginService.userId() ?? 0; // Replace with actual user ID (e.g., from auth service)

      try {
        const result = await this.budgetService.addSavingsAmount(
          userId,
          amount
        );
        console.log('Savings added:', result);
        this.savingsAmount.reset(); // Optional: Reset form after successful submission
      } catch (error) {
        console.error('Error adding savings:', error);
        // Handle error (e.g., show error message to user)
        this.isLoading.set(false);
      } finally {
        this.savings.reload();
        this.expenses.reload();
        this.isLoading.set(false);
      }
    }
  }
  async deductSavings(): Promise<void> {
    this.isLoading.set(true);
    const amount = this.deductSavingsAmount.get('amount')
      ?.value as unknown as number;
    const userId = this.loginService.userId() ?? 0;
    try {
      await this.budgetService.deductSavingsAmount(userId, amount);
    } catch (error) {
      console.error('Error editing savings', error);
      this.isLoading.set(false);
    } finally {
      this.isLoading.set(false);
      this.savings.reload();

      this.deductSavingsAmount.reset();
    }
  }
}

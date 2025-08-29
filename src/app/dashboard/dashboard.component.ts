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
import { TranslatePipe } from '../pipes/translate.pipe';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
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
    effect(() => {
      console.log('Dashboard data:', this.expenses.value());
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

  readonly expensesSortedByPaycheck = computed(() => {
    const expenses = this.expenses.value();
    const paychecks = this.paychecksInfo.value();

    if (!expenses || expenses.length === 0) {
      return [];
    }

    // Group expenses by paycheck ID
    const grouped = expenses.reduce(
      (groups: { [key: string]: any[] }, expense) => {
        const paycheckKey = expense.paycheckId
          ? `paycheck-${expense.paycheckId}`
          : 'no-paycheck';
        if (!groups[paycheckKey]) {
          groups[paycheckKey] = [];
        }
        groups[paycheckKey].push(expense);
        return groups;
      },
      {}
    );

    // Convert to array and sort by paycheck ID
    const sortedGroups = Object.entries(grouped)
      .map(([key, expenseList]) => {
        const paycheckId = key.startsWith('paycheck-')
          ? parseInt(key.replace('paycheck-', ''))
          : null;

        // Find the corresponding paycheck to get the amount
        const paycheck = paychecks?.find((p) => p.id === paycheckId);
        const paycheckAmount = paycheck?.amount || 0;

        // Calculate total expenses for this paycheck
        const totalExpenses = expenseList.reduce(
          (sum, expense) => sum + (expense.payment || 0),
          0
        );
        const remainingBudget = paycheckAmount - totalExpenses;

        return {
          paycheckId,
          originalPaycheckId: paycheckId,
          paycheckAmount,
          totalExpenses,
          remainingBudget,
          expenses: expenseList.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          ),
        };
      })
      .sort((a, b) => {
        // Sort by paycheck ID, with null values last
        if (a.paycheckId === null) return 1;
        if (b.paycheckId === null) return -1;
        return a.paycheckId - b.paycheckId;
      });

    // Assign sequential paycheck numbers for display
    let paycheckCounter = 1;
    return sortedGroups.map((group) => ({
      ...group,
      paycheckLabel:
        group.paycheckId !== null
          ? `Paycheck ${paycheckCounter++}`
          : 'No Paycheck',
    }));
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

  // Selected budget period ID
  selectedBudgetPeriodId = signal<number | null>(null);

  // Create expensesDetailed by grouping expenses from paychecks
  expensesDetailed = computed(() => {
    const paychecks = this.paychecksInfo.value();
    console.log('🔍 Computing expensesDetailed from paychecks:', paychecks);

    if (!paychecks || paychecks.length === 0) {
      console.log('❌ No paychecks found');
      return [];
    }

    // Transform paychecks into the expected format
    const expenseGroups = paychecks
      .map((paycheck) => {
        console.log(`📋 Processing paycheck ${paycheck.id}:`, paycheck);
        return {
          paycheckId: paycheck.id,
          paycheckDate: paycheck.payDate,
          paycheckAmount: paycheck.amount,
          expenses: paycheck.expenses || [],
        };
      })
      .filter((group) => group.expenses.length > 0);

    console.log('✅ Final expense groups:', expenseGroups);
    return expenseGroups;
  });

  // Helper methods for expense icons and calculations
  getExpenseIcon(categoryId: number): string {
    const iconMap: { [key: number]: string } = {
      1: 'fas fa-home', // Housing
      2: 'fas fa-car', // Transportation
      3: 'fas fa-utensils', // Food
      4: 'fas fa-gamepad', // Entertainment
      5: 'fas fa-heartbeat', // Healthcare
      6: 'fas fa-shopping-bag', // Shopping
      7: 'fas fa-graduation-cap', // Education
      8: 'fas fa-users', // Personal
      9: 'fas fa-chart-line', // Investment
      10: 'fas fa-piggy-bank', // Savings
    };
    return iconMap[categoryId] || 'fas fa-receipt';
  }

  getPaycheckTotalExpenses(expenses: any[]): number {
    if (!expenses) return 0;
    return expenses.reduce(
      (total, expense) => total + (expense.payment || 0),
      0
    );
  }

  getPaycheckRemaining(paycheckGroup: any): number {
    const totalExpenses = this.getPaycheckTotalExpenses(paycheckGroup.expenses);
    return paycheckGroup.paycheckAmount - totalExpenses;
  }

  // Helper method to get category name by ID
  getCategoryName(categoryId: number): string {
    const categoryMap: { [key: number]: string } = {
      1: 'Housing',
      2: 'Utilities',
      3: 'Food',
      4: 'Entertainment',
      5: 'Healthcare',
      6: 'Shopping',
      7: 'Education',
      8: 'Personal',
      9: 'Investment',
      10: 'Savings',
    };
    return categoryMap[categoryId] || 'Other';
  }

  // Helper method to get subcategory name by ID (simplified)
  getSubcategoryName(subcategoryId: number | null | undefined): string {
    if (!subcategoryId) return 'General';
    // This would ideally come from a service, but for now return a default
    return 'General';
  }

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

import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { BudgetService } from '../budget.service';
import { DashboardDto } from '../../models/dashboard-dto.type';

import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AddPersonalInfoDto } from '../../models/add-personal-info.type';
import { FormsModule } from '@angular/forms';
import { PaycheckService } from '../services/paycheck.service';
import { Paycheck } from '../../models/paycheck.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { MarkExpenseAsPaidDto } from '../../models/mark-expense-as-paid.type';
import { CategoryEnum } from '../../models/category-enum';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private paycheckService = inject(PaycheckService);
  private budgetService = inject(BudgetService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private deleteExpenseId: number | null = null;
  private deletePaycheckIdTemp: number | null = null;
  dashboardData = signal<DashboardDto | null>(null);
  paychecks = signal<Paycheck[]>([]);
  deleteExpensePaycheckId: number | null = null;
  personalInfo = signal<AddPersonalInfoDto | null>(null);
  categoryEnum = CategoryEnum;

  modalPayType: number = 1;
  modalPayAmount: number | null = null;
  editingPaycheck: 1 | 2 | null = null;
  expensesByPaycheck: { [key: number]: ExpenseResponse[] } = {};
  modalPaycheckId: number | null = null;
  pcks: Paycheck[] = [];
  showAlert = signal<boolean>(false);

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
    loader: () =>
      this.paycheckService.getPaychecks(this.loginService.userId()!),
  });

  constructor() {
    effect(() => console.log(this.paychecksInfo.value()));
  }

  readonly totalIncome = computed(() => {
    const paychecks = this.paychecksInfo.value();
    return paychecks?.reduce((sum, p) => sum + (p.amount || 0), 0);
  });
  
  readonly totalExpenses = computed(() => {
    const paychecks = this.paychecksInfo.value();
    return (
      paychecks?.reduce(
        (sum, p) =>
          sum +
          (p.expenses?.reduce((eSum, e) => eSum + (e.payment || 0), 0) || 0),
        0
      ) || 0
    );
  });

  readonly remainingBudget = computed(
    () => (this.totalIncome() || 0) - (this.totalExpenses() || 0)
  );

  // Calculate total expenses for each paycheck
  readonly paycheckExpenseTotals = computed(() => {
    const paychecks = this.paychecksInfo.value();
    if (!paychecks) return {};
    
    const totals: { [paycheckId: number]: number } = {};
    
    paychecks.forEach(paycheck => {
      const total = paycheck.expenses?.reduce((sum, expense) => sum + (expense.payment || 0), 0) || 0;
      totals[paycheck.id] = total;
    });
    
    return totals;
  });

  // Calculate remaining budget for each paycheck
  readonly paycheckRemainingBudget = computed(() => {
    const paychecks = this.paychecksInfo.value();
    const expenseTotals = this.paycheckExpenseTotals();
    
    if (!paychecks) return {};
    
    const remaining: { [paycheckId: number]: number } = {};
    
    paychecks.forEach(paycheck => {
      const totalExpenses = expenseTotals[paycheck.id] || 0;
      remaining[paycheck.id] = (paycheck.amount || 0) - totalExpenses;
    });
    
    return remaining;
  });

  // Get total paid expenses
  readonly totalPaidExpenses = computed(() => {
    const paychecks = this.paychecksInfo.value();
    return (
      paychecks?.reduce(
        (sum, p) =>
          sum +
          (p.expenses?.reduce((eSum, e) => eSum + (e.isPaid ? (e.payment || 0) : 0), 0) || 0),
        0
      ) || 0
    );
  });

  // Get total unpaid expenses
  readonly totalUnpaidExpenses = computed(() => {
    const paychecks = this.paychecksInfo.value();
    return (
      paychecks?.reduce(
        (sum, p) =>
          sum +
          (p.expenses?.reduce((eSum, e) => eSum + (!e.isPaid ? (e.payment || 0) : 0), 0) || 0),
        0
      ) || 0
    );
  });

  // Helper method to get paid expenses count for a paycheck
  getPaidExpensesCount(paycheckId: number): number {
    const paychecks = this.paychecksInfo.value();
    const paycheck = paychecks?.find(p => p.id === paycheckId);
    return paycheck?.expenses?.filter(e => e.isPaid).length || 0;
  }

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

  updateRemainingBudget() {
    const paychecks = this.paychecks();
    const totalIncome = paychecks.reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalExpenses = paychecks.reduce((expenseSum, p) => {
      const paycheckExpenses =
        p.expenses?.reduce((eSum, e) => eSum + (e.payment || 0), 0) || 0;
      return expenseSum + paycheckExpenses;
    }, 0);

    const remainingBudget = totalIncome - totalExpenses;

    this.dashboardData.update((current) => ({
      ...current!,
      expenses: totalExpenses,
      remainingBudget: remainingBudget,
    }));
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
          this.paychecksInfo.reload();
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
      console.log('Expense marked as paid:', error);
    } finally {
      // Also refresh from server
      this.paychecksInfo.reload();
    }
  }

  handleDeletePaycheck(paycheck: any) {
    this.openDeletePaycheckModal(paycheck.id);
  }

  showExpenseWarningAlert() {
    console.log('showExpenseWarningAlert called');
    this.showAlert.set(true);

    // Hide after 3 seconds
    setTimeout(() => {
      this.showAlert.set(false);
    }, 8000);
  }
}

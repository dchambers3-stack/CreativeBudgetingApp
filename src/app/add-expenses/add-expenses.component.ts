import {
  Component,
  inject,
  signal,
  resource,
  computed,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { LoginService } from '../services/login.service';
import { BudgetService } from '../services/budget.service';
import { AddExpenseDto } from '../../models/add-expenses.type';
import { Category, Subcategory } from '../../models/category.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { DatePipe } from '@angular/common';
import { CategoryEnum } from '../../enums/category-enum';
import { TranslatePipe } from '../pipes/translate.pipe';
import { PaycheckService } from '../services/paycheck.service';

@Component({
  selector: 'app-add-expenses',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe, DatePipe],
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.css'],
})
export class AddExpensesComponent {
  private loginService = inject(LoginService);
  private budgetService = inject(BudgetService);
  paycheckService = inject(PaycheckService);
  private fb = inject(FormBuilder);

  isSuccess = signal(false);
  isError = signal(false);
  categories = resource({ loader: () => this.budgetService.getCategories() });
  subcategories = signal<Subcategory[]>([]);
  category = CategoryEnum;

  expenseForm = this.fb.group({
    id: [0],
    userId: [this.loginService.userId()],
    name: [''],
    payment: [0, Validators.required],
    totalBalance: [0],
    dueDate: [''],
    categoryId: [0, Validators.required],
    subcategoryId: [0],
    isPaid: [false],
    paycheckId: [null, Validators.required],
  });

  expenseList: ExpenseResponse[] = [];

  addExpense() {
    if (this.expenseForm.invalid) {
      this.isError.set(true);
      setTimeout(() => this.isError.set(false), 2000);
      return;
    }
    const formValue = this.expenseForm.value;
    const categoryId = Number(formValue.categoryId) || 0;
    const currentUserId = this.loginService.userId();

    // Debug logging to help identify the issue
    console.log('Current userId from service:', currentUserId);
    console.log('Form userId value:', formValue.userId);

    const expense: AddExpenseDto = {
      id: 0,
      userId: currentUserId ?? 0, // Use current userId from service instead of form value
      name: formValue.name ?? '',
      payment: formValue.payment ?? 0,
      totalBalance: formValue.totalBalance ?? 0,
      dueDate: formValue.dueDate ?? '',
      categoryId: categoryId,
      subcategoryId: categoryId === 10 ? null : formValue.subcategoryId ?? 0,
      isPaid: formValue.isPaid ?? false,
      paycheckId: formValue.paycheckId ?? 0,
    };
    this.budgetService.addExpenses(currentUserId ?? 0, expense).subscribe({
      next: () => {
        this.expenseForm.reset();
        // Re-set the userId after reset to ensure it's available for the next expense
        this.expenseForm.patchValue({
          userId: this.loginService.userId(),
        });
        this.isSuccess.set(true);
        setTimeout(() => this.isSuccess.set(false), 2000);
      },
      error: (error) => {
        console.error('Add expense error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.isError.set(true);
        setTimeout(() => this.isError.set(false), 2000);
      },
    });
  }

  editExpense(expense: ExpenseResponse) {
    this.expenseForm.patchValue({
      id: expense.id,
      userId: expense.userId,
      name: expense.name,
      payment: expense.payment,
      dueDate: expense.dueDate,
      categoryId: expense.categoryId,
      subcategoryId: expense.subcategoryId,
      isPaid: expense.isPaid,
    });
  }

  saveEditedExpense() {
    if (this.expenseForm.invalid) {
      this.isError.set(true);
      setTimeout(() => this.isError.set(false), 2000);
      return;
    }
    const formValue = this.expenseForm.value;
    const expense: AddExpenseDto = {
      id: formValue.id ?? 0,
      userId: formValue.userId ?? 0,
      name: formValue.name ?? '',
      payment: formValue.payment ?? 0,
      totalBalance: formValue.totalBalance ?? 0,
      dueDate: formValue.dueDate ?? '',
      categoryId: formValue.categoryId ?? 0,
      subcategoryId: formValue.subcategoryId ?? 0,
      isPaid: formValue.isPaid ?? false,
    };
    this.budgetService.editExpenses(expense.userId, expense).subscribe({
      next: () => {
        this.expenseForm.reset();
        // Re-set the userId after reset to ensure it's available for the next expense
        this.expenseForm.patchValue({
          userId: this.loginService.userId(),
        });
        this.isSuccess.set(true);
        setTimeout(() => this.isSuccess.set(false), 2000);
      },
      error: () => {
        this.isError.set(true);
        setTimeout(() => this.isError.set(false), 2000);
      },
    });
  }

  deleteExpense(id: number) {
    this.budgetService.deleteExpenses(id).subscribe({
      next: () => {
        this.isSuccess.set(true);
        setTimeout(() => this.isSuccess.set(false), 2000);
      },
      error: () => {
        this.isError.set(true);
        setTimeout(() => this.isError.set(false), 2000);
      },
    });
  }

  async getSubcategories(categoryId: number): Promise<void> {
    try {
      const data = await this.budgetService.getSubcategoriesByCategory(
        categoryId
      );
      this.subcategories.set(data);
    } catch (error) {
      throw new Error('An error has occurred.');
    }
  }

  selectCategory(categoryId: number) {
    this.expenseForm.patchValue({ categoryId, subcategoryId: 0 });
    this.getSubcategories(categoryId);
  }

  selectSubcategory(subcategoryId: number) {
    this.expenseForm.patchValue({ subcategoryId });
  }

  loadExpenseForEdit(expense: ExpenseResponse) {
    this.editExpense(expense);
    if (expense.categoryId) {
      this.getSubcategories(expense.categoryId);
    }
  }

  get totalPayment(): number {
    return this.expenseList.reduce(
      (sum, expense) => sum + Number(expense.payment || 0),
      0
    );
  }
  paycheckInfo = resource({
    loader: () =>
      this.paycheckService.getPaychecks(this.loginService.userId() ?? 0),
  });
}

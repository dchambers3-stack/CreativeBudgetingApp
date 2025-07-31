import { Component, inject, signal, resource } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../login.service';
import { BudgetService } from '../budget.service';
import { AddExpenseDto } from '../../models/add-expenses.type';
import { Category, Subcategory } from '../../models/category.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-expenses',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.css'],
})
export class AddExpensesComponent {
  private loginService = inject(LoginService);
  private budgetService = inject(BudgetService);
  private fb = inject(FormBuilder);

  isSuccess = signal(false);
  isError = signal(false);
  categories = resource({ loader: () => this.budgetService.getCategories() });
  subcategories = signal<Subcategory[]>([]);

  expenseForm = this.fb.group({
    id: [0],
    userId: [this.loginService.userId(), Validators.required],
    name: ['', Validators.required],
    payment: [0, Validators.required],
    totalBalance: [0, Validators.required],
    dueDate: ['', Validators.required],
    categoryId: [0, Validators.required],
    subcategoryId: [0, Validators.required],
    isPaid: [false, Validators.required],
  });

  expenseList: ExpenseResponse[] = [];

  addExpense() {
    if (this.expenseForm.invalid) {
      this.isError.set(true);
      setTimeout(() => this.isError.set(false), 2000);
      return;
    }
    const formValue = this.expenseForm.value;
    const expense: AddExpenseDto = {
      id: 0,
      userId: formValue.userId ?? 0,
      name: formValue.name ?? '',
      payment: formValue.payment ?? 0,
      totalBalance: formValue.totalBalance ?? 0,
      dueDate: formValue.dueDate ?? '',
      categoryId: formValue.categoryId ?? 0,
      subcategoryId: formValue.subcategoryId ?? 0,
      isPaid: formValue.isPaid ?? false,
    };
    this.budgetService
      .addExpenses(this.loginService.userId() ?? 0, expense)
      .subscribe({
        next: () => {
          this.expenseForm.reset();
          this.isSuccess.set(true);
          setTimeout(() => this.isSuccess.set(false), 2000);
        },
        error: () => {
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
      const data = await this.budgetService.getSubcategoriesByCategory(categoryId);
      this.subcategories.set(data);
    } catch(error) {
      throw new Error("An error has occurred.")
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
}

import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login.service';
import { BudgetService } from '../budget.service';
import { AddExpenseDto } from '../../models/add-expenses.type';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Category, Subcategory } from '../../models/category.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { PaycheckService } from '../services/paycheck.service';

@Component({
  selector: 'app-add-expenses',
  imports: [FormsModule, DatePipe],
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.css'],
})
export class AddExpensesComponent {
  private loginService = inject(LoginService);
  private budgetService = inject(BudgetService);
  private paycheckService = inject(PaycheckService);
  isSuccess = signal(false);
  isError = signal(false);
  // categories = signal<Category[]>([]);
  subcategories = signal<Subcategory[]>([]);
  paychecks: any[] = [];
  selectedPaycheckId?: number;

  expenses: AddExpenseDto = {
    id: 0,
    name: '',
    payment: 0,
    userId: 0,
    dueDate: '',
    categoryId: 0,
    subcategoryId: 0,
    paycheckDate: '',
    isPaid: false,
  };
  expenseList: ExpenseResponse[] = [];

  constructor() {
    effect(() => console.log(this.categories.value()));
  }

  paychecksInfo = resource({
    loader: () =>
      this.paycheckService.getPaychecks(this.loginService.userId()!),
  });
  // getCategoryName(categoryId: number): string {
  //   const catValue = this.categories.value();
  //   const category = catValue.find((cat) => cat.id === categoryId);
  //   return category ? category.name : '';
  // }

  addExpense() {
    const userId = this.loginService.userId();

    if (userId !== null && this.selectedPaycheckId !== undefined) {
      this.expenses.userId = userId;
      this.expenses.paycheckDate = this.selectedPaycheckId.toString();

      if (
        !this.expenses.name ||
        !this.expenses.payment ||
        !this.expenses.dueDate
      ) {
        console.error('Missing required fields');
        return;
      }

      this.budgetService
        .addExpenses(this.selectedPaycheckId, this.expenses)
        .subscribe({
          next: (data) => {
            this.resetExpenseForm();
            // this.getExpenses();
            this.isSuccess.set(true);
            setTimeout(() => {
              this.isSuccess.set(false);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error adding expense', error);
          },
        });
    } else {
      console.error('User ID or Paycheck ID is missing');
      this.isError.set(true);
      setTimeout(() => {
        this.isError.set(false);
      }, 2000);
    }
  }
  resetExpenseForm() {
    this.expenses = {
      id: 0,
      name: '',
      payment: 0,
      userId: 0,
      dueDate: '',
      categoryId: 0,
      subcategoryId: 0,
      paycheckDate: '',
      isPaid: false,
    };
  }

  editExpense() {
    const userId = this.loginService.userId();

    if (userId !== null) {
      this.expenses.userId = userId;
      this.budgetService.editExpenses(userId, this.expenses).subscribe({
        next: (data) => {
          // this.getExpenses();
        },
        error: (error) => {
          console.error('Error editing expense', error);
        },
      });
    }
  }

  deleteExpense(id: number) {
    this.budgetService.deleteExpenses(id).subscribe({
      next: (data) => {
        // this.getExpenses();
      },
      error: (error) => {
        console.error('Error deleting expense', error);
      },
    });
  }

  //this.expenseList = data;
  // getCategories() {
  //   this.budgetService.getCategories().subscribe({
  //     next: (data) => {
  //       this.categories.set(data);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching categories', error);
  //     },
  //   });
  // }
  categories = resource({
    loader: () => this.budgetService.getCategories(),
  });

  async getSubcategories(categoryId: number): Promise<void> {
    try {
      const data = await this.budgetService.getSubcategoriesByCategory(
        categoryId
      );
      this.subcategories.set(data);
    } catch (error) {
      console.error('Error fetching subcategories', error);
    }
  }

  selectCategory(categoryId: number) {
    this.expenses.categoryId = categoryId;
    this.expenses.subcategoryId = 0;
    this.getSubcategories(categoryId);
  }

  selectSubcategory(subcategoryId: number) {
    this.expenses.subcategoryId = subcategoryId;
  }

  loadExpenseForEdit(expense: ExpenseResponse) {
    this.expenses = {
      id: expense.id,
      name: expense.name,
      payment: expense.payment,
      userId: expense.userId,
      dueDate: expense.dueDate,
      categoryId: expense.categoryId,
      subcategoryId: expense.subcategoryId,
      isPaid: expense.isPaid,
      paycheckDate: expense.paycheckId.toString(),
    };

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

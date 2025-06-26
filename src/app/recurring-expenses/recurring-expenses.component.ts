import { Component, effect, inject, resource, signal } from '@angular/core';
import { LoginService } from '../login.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { RecurringExpenseDto } from '../../models/recurring-expense-dto';
import { CurrencyPipe, DatePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { FrequencyEnum } from '../../models/frequency-enum';
import { Category, Subcategory } from '../../models/category.type';
import { PaycheckService } from '../services/paycheck.service';

@Component({
  selector: 'app-recurring-expenses',
  imports: [ReactiveFormsModule, CurrencyPipe, TitleCasePipe, DatePipe],
  templateUrl: './recurring-expenses.component.html',
  styleUrl: './recurring-expenses.component.css',
})
export class RecurringExpensesComponent {
  frequencyEnum = FrequencyEnum;
  loginService = inject(LoginService);
  budgetService = inject(BudgetService);
  paycheckService = inject(PaycheckService)

  userId = this.loginService.userId();
  formBuilder = inject(FormBuilder);
  userIdNumber = Number(this.loginService.userId());
  subcategories = signal<Subcategory[]>([]);
  paychecksInfo = resource({
    loader: () =>
      this.paycheckService.getPaychecks(this.loginService.userId()!),
  });
  
  form = this.formBuilder.group({
    recurringExpenseName: [null, Validators.required],
    recurringAmount: [null, Validators.required],
    categoryId: [null as number | null, Validators.required],
    subcategoryId: [null as number | null, Validators.required],
    userId: this.userIdNumber,
    paycheckId: [null, Validators.required]
  });

  options = [
    { value: this.frequencyEnum.Daily, label: 'Daily' },
    { value: this.frequencyEnum.Weekly, label: 'Weekly' },
    { value: this.frequencyEnum.Biweekly, label: 'Biweekly' },
    { value: this.frequencyEnum.Monthly, label: 'Monthly' },
    { value: this.frequencyEnum.Yearly, label: 'Yearly' },
  ];

  categories = resource({
    loader: () => this.budgetService.getCategories(),
  });

  async addRecurringExpense(): Promise<void> {
    if (this.form.valid) {
      const recurringExpense: RecurringExpenseDto = this.form.value;
      try {
        await this.budgetService.addRecurringExpense(
          recurringExpense,
          this.userId ?? 0
        );
        alert('Recurring expense added successfully!');

        console.log(recurringExpense);
      } catch (error) {
        console.error('Error adding recurring expense:', error);
        alert('Failed to add recurring expense. Please try again.');
      } finally {
        this.recurringExpense.reload();
        this.resetForm();
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  resetForm() {
    this.form.reset({
      userId: this.userIdNumber,
      recurringExpenseName: null,
      recurringAmount: null,
      categoryId: null,
      subcategoryId: null,
    });
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  recurringExpense = resource({
    loader: () => this.budgetService.getRecurringExpenses(this.userId ?? 0),
  });

  async getSubcategories(categoryId: number): Promise<void> {
    try {
      const data = await this.budgetService.getSubcategoriesByCategory(categoryId);
      this.subcategories.set(data);
      // Reset subcategory selection when category changes
      this.form.patchValue({ subcategoryId: null });
    } catch (error) {
      console.error('Error fetching subcategories', error);
    }
  }

  selectCategory(categoryId: number | null) {
    this.form.patchValue({ 
      categoryId: categoryId || null, 
      subcategoryId: null 
    });
    if (categoryId) {
      this.getSubcategories(categoryId);
    }
  }

  getFrequencyName(frequency: number): string {
    switch (frequency) {
      case this.frequencyEnum.Daily:
        return 'Daily';
      case this.frequencyEnum.Weekly:
        return 'Weekly';
      case this.frequencyEnum.Biweekly:
        return 'Biweekly';
      case this.frequencyEnum.Monthly:
        return 'Monthly';
      case this.frequencyEnum.Yearly:
        return 'Yearly';
      default:
        return 'Monthly';
    }
  }

  async removeExpense(id: string): Promise<void> {
    try {
      
     await this.budgetService.deleteRecurringExpense(id)
     this.recurringExpense.reload()
    } catch (error) {
      console.error('Error removing expense, please try again later.', error);
      
    }
  }
}

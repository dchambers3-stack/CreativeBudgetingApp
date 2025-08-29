import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import type { DashboardDto } from '../../models/dashboard-dto.type';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { AddPersonalInfoDto } from '../../models/add-personal-info.type';
import { AddExpenseDto } from '../../models/add-expenses.type';
import { Category, Subcategory } from '../../models/category.type';
import { ExpenseResponse } from '../../models/expense-response.typ';
import { User } from '../../models/user.type';
import { Paycheck } from '../../models/paycheck.type';
import { MarkExpenseAsPaidDto } from '../../models/mark-expense-as-paid.type';
import { RecurringExpenseDto } from '../../models/recurring-expense-dto';
import { BudgetPeriod } from '../../models/budget-period';
import { SavingsDto } from '../../models/savings-dto.type';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private apiUrl = 'https://localhost:5001/api/budget';
  private http = inject(HttpClient);
  constructor() {}

  async getDashboardInfo(userId: number): Promise<DashboardDto> {
    return await lastValueFrom(
      this.http.get<DashboardDto>(`${this.apiUrl}/dashboard-info/${userId}`)
    );
  }

  addPersonalInfo(userId: number, personalInfo: AddPersonalInfoDto) {
    return this.http.post(
      `${this.apiUrl}/personal-info/${userId}`,
      personalInfo
    );
  }
  editPersonalInfo(userId: number, personalInfo: AddPersonalInfoDto) {
    return this.http.patch(
      `${this.apiUrl}/personal-info/${userId}`,
      personalInfo
    );
  }
  addExpenses(userId: number, expenses: AddExpenseDto) {
    return this.http.post(`${this.apiUrl}/expenses/${userId}`, expenses);
  }
  editExpenses(userId: number, expenses: AddExpenseDto) {
    return this.http.put(`${this.apiUrl}/expenses/${userId}`, expenses);
  }
  deleteExpenses(id: number) {
    return this.http.delete(`${this.apiUrl}/expenses/${id}`);
  }

  async getExpenses(userId: number): Promise<ExpenseResponse[]> {
    return await firstValueFrom(
      this.http.get<ExpenseResponse[]>(`${this.apiUrl}/expenses/${userId}`)
    );
  }
  async getCategories(): Promise<Category[]> {
    return await firstValueFrom(
      this.http.get<Category[]>(`${this.apiUrl}/categories`)
    );
  }
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Fetches subcategories of a given category from the API
   * @param categoryId Id of the category
   * @returns A promise that resolves to an array of subcategories
   */
  /*******  fac9094c-d7b4-44c4-86e9-55626bf3a61b  *******/
  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return await firstValueFrom(
      this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories/${categoryId}`)
    );
  }
  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<User> {
    const payload = {
      username: userData.username,
      email: userData.email,
      hash: userData.password,
    };

    return this.http.post<User>(`${this.apiUrl}/user`, payload);
  }

  async markExpenseAsPaid(
    id: number,
    dto: MarkExpenseAsPaidDto
  ): Promise<MarkExpenseAsPaidDto> {
    return await firstValueFrom(
      this.http.patch<MarkExpenseAsPaidDto>(
        `${this.apiUrl}/expenses/${id}/status`,
        dto
      )
    );
  }

  async getExpenseById(id: number): Promise<AddExpenseDto> {
    return await firstValueFrom(
      this.http.get<AddExpenseDto>(`${this.apiUrl}/expense/${id}`)
    );
  }

  async getRecurringExpenses(userId: number): Promise<RecurringExpenseDto[]> {
    return await firstValueFrom(
      this.http.get<RecurringExpenseDto[]>(
        `${this.apiUrl}/expenses/${userId}/recurring-expenses`
      )
    );
  }
  async deleteRecurringExpense(id: string): Promise<void> {
    return await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/recurring-expense/${id}`)
    );
  }
  async uploadProfilePicture(userId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return await firstValueFrom(
      this.http.post<void>(`${this.apiUrl}/${userId}/profile-picture`, formData)
    );
  }
  async getProfilePicture(userId: number): Promise<Blob> {
    const timestamp = new Date().getTime();
    return await firstValueFrom(
      this.http.get(`${this.apiUrl}/${userId}/profile-picture?t=${timestamp}`, {
        responseType: 'blob',
      })
    );
  }
  async updateProfilePicture(userId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return await firstValueFrom(
      this.http.put<void>(`${this.apiUrl}/${userId}/profile-picture`, formData)
    );
  }

  async getSavingsAmount(userId: number): Promise<SavingsDto> {
    return await firstValueFrom(
      this.http.get<SavingsDto>(`${this.apiUrl}/${userId}/savings`)
    );
  }
  async addSavingsAmount(userId: number, amount: number): Promise<SavingsDto> {
    const url = `${this.apiUrl}/savings/${userId}`;
    const body = { amount }; // Send { "amount": number }

    try {
      return await firstValueFrom(this.http.post<SavingsDto>(url, body));
    } catch (error) {
      console.error('Error adding savings:', error);
      throw error; // Rethrow for component to handle
    }
  }
  async deductSavingsAmount(
    userId: number,
    amount: number
  ): Promise<SavingsDto> {
    const body = { amount };
    return await firstValueFrom(
      this.http.put<SavingsDto>(`${this.apiUrl}/savings/${userId}`, body)
    );
  }
  async getExpensesByPaycheck(paycheckId: number): Promise<AddExpenseDto[]> {
    return await firstValueFrom(
      this.http.get<AddExpenseDto[]>(
        `${this.apiUrl}/expenses/paycheck/${paycheckId}`
      )
    );
  }
}

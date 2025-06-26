import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import type { DashboardDto } from '../models/dashboard-dto.type';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { AddPersonalInfoDto } from '../models/add-personal-info.type';
import { AddExpenseDto } from '../models/add-expenses.type';
import { Category, Subcategory } from '../models/category.type';
import { ExpenseResponse } from '../models/expense-response.typ';
import { User } from '../models/user.type';
import { Paycheck } from '../models/paycheck.type';
import { MarkExpenseAsPaidDto } from '../models/mark-expense-as-paid.type';
import { RecurringExpenseDto } from '../models/recurring-expense-dto';

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
  addExpenses(paycheckId: number, expenses: AddExpenseDto) {
    return this.http.post(`${this.apiUrl}/expenses/${paycheckId}`, expenses);
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
  async addRecurringExpense(
    dto: RecurringExpenseDto,
    userId: number
  ): Promise<number> {
    return await firstValueFrom(
      this.http.post<number>(
        `${this.apiUrl}/expenses/${userId}/recurring-expense`,
        dto
      )
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
    )
  }
  async uploadProfilePicture(userId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return await firstValueFrom(
      this.http.post<void>(`${this.apiUrl}/${userId}/profile-picture`, formData)
    );
  }
  async getProfilePicture(userId: number): Promise<Blob> {
    return await firstValueFrom(
      this.http.get(`${this.apiUrl}/${userId}/profile-picture`, { responseType: 'blob' })
    );
  }
}

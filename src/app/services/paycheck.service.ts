import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Paycheck } from '../../models/paycheck.type';

@Injectable({
  providedIn: 'root',
})
export class PaycheckService {
  private apiUrl = 'https://localhost:5001/api/paychecks';

  constructor(private http: HttpClient) {}

  async getPaychecks(userId: number): Promise<Paycheck[]> {
    return await firstValueFrom(
      this.http.get<Paycheck[]>(`${this.apiUrl}/${userId}`)
    );
  }
  async getPaychecksForBudget( userId: number): Promise<Paycheck[]> {
    return await firstValueFrom(
      this.http.get<Paycheck[]>(`${this.apiUrl}/${userId}/budget`)
    );
  }
 

  async createPaycheck(userId: number, paycheck: Paycheck): Promise<Paycheck> {
    const requestBody = {
      payDate: new Date(paycheck.payDate).toISOString(),
      amount: paycheck.amount,
    };

    return await firstValueFrom(
      this.http.post<Paycheck>(`${this.apiUrl}/${userId}`, requestBody)
    );
  }

  async updatePaycheck(id: number, paycheck: Paycheck): Promise<void> {
    return await firstValueFrom(
      this.http.put<void>(`${this.apiUrl}/${id}`, paycheck)
    );
  }

  async deletePaycheck(id: number): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}

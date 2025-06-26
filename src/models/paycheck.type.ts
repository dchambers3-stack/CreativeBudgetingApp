import { AddExpenseDto } from './add-expenses.type';
import { ExpenseResponse } from './expense-response.typ';

export type Paycheck = {
  paycheck1: number;
  paycheck2: number;
  id: number;
  userId: number;
  payDate: string; // ISO format
  amount: number;
  expenses: ExpenseResponse[]; // List of expenses associated with this paycheck
};

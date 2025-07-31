export type Paycheck = {
  paycheck1: number;
  paycheck2: number;
  id: number;
  userId: number;
  payDate: string; // ISO format
  amount: number;
  totalBalance: number;
  expenses?: any[];
};

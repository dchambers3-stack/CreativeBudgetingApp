export interface AddExpenseDto {
  id: number;
  name?: string;
  payment: number;
  userId: number;
  dueDate?: string;
  categoryId: number;
  totalBalance: number;
  subcategoryId?: number | null;
  isPaid: boolean;
}

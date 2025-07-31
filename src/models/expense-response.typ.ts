export type ExpenseResponse = {
  id: number;
  userId: number;
  name: string;
  payment: number;
  totalBalance?: number;
  dueDate: string;
  categoryId: number;
  categoryName: string;
  subcategoryId: number;
  subcategoryName: string;
  isPaid: boolean;
};

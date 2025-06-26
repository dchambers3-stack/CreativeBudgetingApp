export type ExpenseResponse = {
  id: number;
  userId: number;
  name: string;
  payment: number;
  dueDate: string;
  categoryId: number;
  categoryName: string;
  subcategoryId: number;
  subcategoryName: string;
  paycheckId: number;
  isPaid: boolean;
};

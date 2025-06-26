export interface AddExpenseDto {
  id: number;
  name: string;
  payment: number;
  userId: number;
  dueDate: string;
  categoryId: number;

  subcategoryId: number;
  paycheckDate: string;
  isPaid: boolean;
}

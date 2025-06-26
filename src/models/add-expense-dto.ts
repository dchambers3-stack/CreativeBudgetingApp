export interface AddExpenseDto {
  id: number;
  userId: number;
  paycheckId: number;
  paycheckDate: string;
  name: string;
  payment: number;
  dueDate: string | Date;
  categoryId: number;
  subcategoryId: number;
  isPaid: boolean;
}

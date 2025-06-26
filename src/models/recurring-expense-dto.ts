export interface RecurringExpenseDto {
  id?: string | null;
  recurringExpenseName?: string | null;
  recurringAmount?: number | null;
  frequencyId?: number | null;
  userId?: number | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  paycheckId?: number | null;
}

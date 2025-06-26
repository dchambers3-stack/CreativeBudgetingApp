using CreativeBudgeting.Models;
using Microsoft.EntityFrameworkCore;

namespace CreativeBudgeting.Services
{
    public class RecurringService
    {
        private readonly BudgetDbContext _context;

        public RecurringService(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task GenerateMonthlyRecurringExpensesAsync()
        {
            var today = DateTime.Today;
            var recurringExpenses = await _context.RecurringExpenses.ToListAsync();
            
            // Get default category and subcategory as fallback
            var defaultCategory = await _context.Categories.FirstOrDefaultAsync();
            if (defaultCategory == null)
            {
                throw new InvalidOperationException("No categories found in the database.");
            }
            
            var defaultSubcategory = await _context.Subcategories
                .Where(s => s.CategoryId == defaultCategory.Id)
                .FirstOrDefaultAsync();
            
            if (defaultSubcategory == null)
            {
                throw new InvalidOperationException("No subcategories found for the default category.");
            }

            foreach (var re in recurringExpenses)
            {
                var expenses = await _context
                    .Expenses.Where(e => e.RecurringExpenseId == re.Id)
                    .ToListAsync();

                var existsThisMonth = expenses.Any(e =>
                    DateTime.TryParse(e.DueDate, out var dueDate) &&
                    dueDate.Month == today.Month &&
                    dueDate.Year == today.Year
                );

                if (!existsThisMonth)
                {
                    // Use the category/subcategory from recurring expense, or fallback to defaults
                    var categoryId = re.CategoryId ?? defaultCategory.Id;
                    var subcategoryId = re.SubcategoryId ?? defaultSubcategory.Id;
                    
                    // Validate that the subcategory belongs to the selected category
                    if (re.SubcategoryId.HasValue && re.CategoryId.HasValue)
                    {
                        var validSubcategory = await _context.Subcategories
                            .FirstOrDefaultAsync(s => s.Id == re.SubcategoryId && s.CategoryId == re.CategoryId);
                        
                        if (validSubcategory == null)
                        {
                            // If invalid combination, use defaults
                            categoryId = defaultCategory.Id;
                            subcategoryId = defaultSubcategory.Id;
                        }
                    }

                    var newExpense = new Expense
                    {
                        UserId = re.UserId,
                        Name = re.RecurringExpenseName,
                        Payment = (double)re.RecurringAmount,
                        DueDate = today.ToString("yyyy-MM-dd"),
                        RecurringExpenseId = re.Id,
                        IsPaid = false,
                        CategoryId = categoryId,
                        SubcategoryId = subcategoryId
                    };

                    _context.Expenses.Add(newExpense);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
} 
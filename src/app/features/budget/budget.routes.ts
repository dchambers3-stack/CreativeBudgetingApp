import { Routes } from '@angular/router';

export const budgetRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../../dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'pay-info',
    loadComponent: () =>
      import('../../pay-details/pay-details.component').then(
        (c) => c.PayDetailsComponent
      ),
  },
  {
    path: 'add-expenses',
    loadComponent: () =>
      import('../../add-expenses/add-expenses.component').then(
        (c) => c.AddExpensesComponent
      ),
  },
  {
    path: 'paychecks',
    loadComponent: () =>
      import('../../paycheck/paycheck.component').then(
        (c) => c.PaycheckComponent
      ),
  },
  {
    path: 'how-to-budget',
    loadComponent: () =>
      import('../../how-to-budget/how-to-budget.component').then(
        (c) => c.HowToBudgetComponent
      ),
  },
];

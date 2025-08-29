import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: 'budget',
    loadChildren: () =>
      import('./features/budget/budget.routes').then((r) => r.budgetRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'helpdesk',
    loadChildren: () =>
      import('./features/helpdesk/helpdesk.routes').then(
        (r) => r.helpdeskRoutes
      ),
    canActivate: [authGuard],
  },
  // Legacy routes for backward compatibility (can be removed later)
  {
    path: 'login',
    redirectTo: '/auth/login',
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
  },
  {
    path: 'dashboard',
    redirectTo: '/budget/dashboard',
  },
  {
    path: 'pay-info',
    redirectTo: '/budget/pay-info',
  },
  {
    path: 'add-expenses',
    redirectTo: '/budget/add-expenses',
  },
  {
    path: 'paychecks',
    redirectTo: '/budget/paychecks',
  },
  {
    path: 'how-to-budget',
    redirectTo: '/budget/how-to-budget',
  },
  {
    path: 'create-ticket',
    redirectTo: '/helpdesk/create-ticket',
  },
  {
    path: 'tickets',
    redirectTo: '/helpdesk/tickets',
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];

import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PayDetailsComponent } from './pay-details/pay-details.component';
import { AddExpensesComponent } from './add-expenses/add-expenses.component';
import { HowToBudgetComponent } from './how-to-budget/how-to-budget.component';
import { RegisterComponent } from './register/register.component';
import { PaycheckComponent } from './paycheck/paycheck.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { MyTicketsComponent } from './my-tickets/my-tickets.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pay-info', component: PayDetailsComponent },
  { path: 'add-expenses', component: AddExpensesComponent },
  { path: 'how-to-budget', component: HowToBudgetComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'paychecks', component: PaycheckComponent },
  { path: 'create-ticket', component: CreateTicketComponent },
  { path: 'tickets', component: MyTicketsComponent },
];

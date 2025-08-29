import { Routes } from '@angular/router';

export const helpdeskRoutes: Routes = [
  {
    path: 'create-ticket',
    loadComponent: () =>
      import('../../create-ticket/create-ticket.component').then(
        (c) => c.CreateTicketComponent
      ),
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('../../my-tickets/my-tickets.component').then(
        (c) => c.MyTicketsComponent
      ),
  },
  {
    path: 'ticket-details/:id',
    loadComponent: () =>
      import('../../ticket-details/ticket-details.component').then(
        (c) => c.TicketDetailsComponent
      ),
  },
];

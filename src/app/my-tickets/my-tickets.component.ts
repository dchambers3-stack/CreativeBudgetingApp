import { Component, effect, inject, resource } from '@angular/core';
import { HelpdeskService } from '../services/helpdesk.service';
import { TicketSeverity } from '../../enums/ticket-severity-enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-tickets',
  imports: [CommonModule],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.css',
})
export class MyTicketsComponent {
  private helpdeskService = inject(HelpdeskService);
  constructor() {
    effect(() => console.log('Tickets loaded:', this.tickets.value()));
  }
  tickets = resource({
    loader: () => this.helpdeskService.getHelpdeskTickets(),
  });

  getSeverityName(severityId: number): string {
    return TicketSeverity[severityId] || 'Unknown';
  }
  getSeverityColor(severityId: number): string {
    switch (severityId) {
      case TicketSeverity.Low:
        return '#388e3c'; // dark green
      case TicketSeverity.Medium:
        return '#f57c00'; // dark orange
      case TicketSeverity.High:
        return '#d32f2f'; // dark red
      case TicketSeverity.Urgent:
        return '#6a1b9a'; // deep purple
      default:
        return '#757575'; // gray
    }
  }
  async resolveTicket(ticketId: number): Promise<void> {
    try {
      await this.helpdeskService.resolveTicket(ticketId);
    } catch (error) {
      console.error('Error resolving ticket:', error);
    } finally {
      this.tickets.reload();
    }
  }
}

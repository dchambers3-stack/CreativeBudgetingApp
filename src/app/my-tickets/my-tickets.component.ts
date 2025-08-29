import { Component, computed, effect, inject, resource } from '@angular/core';
import { HelpdeskService } from '../services/helpdesk.service';
import { TicketSeverity } from '../../enums/ticket-severity-enum';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Router, RouterLink } from '@angular/router';
import { ProfanityFilterService } from '../services/profanity-filter.service';

@Component({
  selector: 'app-my-tickets',
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.css',
})
export class MyTicketsComponent {
  private helpdeskService = inject(HelpdeskService);
  private profanityFilter = inject(ProfanityFilterService);
  private router = inject(Router);

  constructor() {
    effect(() => console.log('Tickets loaded:', this.tickets.value()));
  }

  tickets = resource({
    loader: () => this.helpdeskService.getHelpdeskTickets(),
  });

  // Add computed property to filter all ticket content
  filteredTickets = computed(() => {
    const tickets = this.tickets.value();
    if (!tickets) return [];

    return tickets.map((ticket) => ({
      ...ticket,
      subject: this.profanityFilter.clean(ticket.subject),
      message: this.profanityFilter.clean(ticket.message),
    }));
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
  async navigateToTicketDetails(ticketId: number): Promise<void> {
    this.router.navigate(['/ticket-details', ticketId]);
  }
}

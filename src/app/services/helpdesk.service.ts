import { inject, Injectable } from '@angular/core';
import { HelpdeskTicket } from '../../models/helpdesk-ticket.type';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { TicketReplyDto } from '../../models/ticket-reply-dto';
import { ProfanityFilterService } from './profanity-filter.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HelpdeskService {
  private apiUrl = `${environment.apiUrl}/helpdesk`;
  private http = inject(HttpClient);
  private profanityFilter = inject(ProfanityFilterService);

  async createTicket(body: HelpdeskTicket): Promise<HelpdeskTicket> {
    // Filter outgoing data
    const filteredBody = this.profanityFilter.processBackendData(body, [
      'message',
      'description',
      'title',
    ]);

    const result = await lastValueFrom(
      this.http.post<HelpdeskTicket>(
        `${this.apiUrl}/helpdesk-ticket`,
        filteredBody
      )
    );

    // Filter incoming data from backend
    return this.profanityFilter.processBackendData(result, [
      'message',
      'description',
      'title',
    ]);
  }

  async getHelpdeskTickets(): Promise<HelpdeskTicket[]> {
    const result = await lastValueFrom(
      this.http.get<HelpdeskTicket[]>(`${this.apiUrl}/helpdesk-tickets`)
    );

    // Filter incoming data from backend
    return this.profanityFilter.processBackendDataArray(result, [
      'message',
      'description',
      'title',
    ]);
  }

  async getTicketDetails(ticketId: string | null): Promise<HelpdeskTicket> {
    const result = await lastValueFrom(
      this.http.get<HelpdeskTicket>(
        `${this.apiUrl}/helpdesk-ticket/${ticketId}`
      )
    );

    // Filter incoming data from backend
    return this.profanityFilter.processBackendData(result, [
      'message',
      'description',
      'title',
    ]);
  }
  async resolveTicket(ticketId: number): Promise<void> {
    return await lastValueFrom(
      this.http.patch<void>(`${this.apiUrl}/resolve-ticket/${ticketId}`, {})
    );
  }
  async unresolveTicket(ticketId: number): Promise<void> {
    return await lastValueFrom(
      this.http.patch<void>(`${this.apiUrl}/unresolve-ticket/${ticketId}`, {})
    );
  }
  sendTicketReply(ticketId: string, replyDto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${ticketId}/reply`, replyDto);
  }
}

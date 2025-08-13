import { inject, Injectable } from '@angular/core';
import { HelpdeskTicket } from '../../models/helpdesk-ticket.type';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpdeskService {
  private apiUrl = 'https://localhost:5001/api/helpdesk';
  private http = inject(HttpClient);

  async createTicket(body: HelpdeskTicket): Promise<HelpdeskTicket> {
    return await lastValueFrom(
      this.http.post<HelpdeskTicket>(`${this.apiUrl}/helpdesk-ticket`, body)
    );
  }
  async getHelpdeskTickets(): Promise<HelpdeskTicket[]> {
    return await lastValueFrom(
      this.http.get<HelpdeskTicket[]>(`${this.apiUrl}/helpdesk-tickets`)
    );
  }
  async resolveTicket(ticketId: number): Promise<void> {
    return await lastValueFrom(
      this.http.patch<void>(`${this.apiUrl}/resolve-ticket/${ticketId}`, {})
    );
  }
}

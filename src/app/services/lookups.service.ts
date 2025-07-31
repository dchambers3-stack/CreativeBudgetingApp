import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TicketSeverity } from '../../models/ticket-severity.type';

@Injectable({
  providedIn: 'root',
})
export class LookupsService {
  private apiUrl = 'https://localhost:5001/api/lookups';
  private http = inject(HttpClient);

  async getTicketSeverities(): Promise<TicketSeverity[]> {
    return await lastValueFrom(
      this.http.get<TicketSeverity[]>(`${this.apiUrl}/ticket-severities`)
    );
  }
}

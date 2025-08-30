import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TicketSeverity } from '../../models/ticket-severity.type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LookupsService {
  private apiUrl = `${environment.apiUrl}/lookups`;
  private http = inject(HttpClient);

  async getTicketSeverities(): Promise<TicketSeverity[]> {
    return await lastValueFrom(
      this.http.get<TicketSeverity[]>(`${this.apiUrl}/ticket-severities`)
    );
  }
}

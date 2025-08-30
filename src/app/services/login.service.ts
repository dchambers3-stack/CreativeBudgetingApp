import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable, single, tap } from 'rxjs';
import { DashboardDto } from '../../models/dashboard-dto.type';
import { User } from '../../models/user.type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  apiUrl = `${environment.apiUrl}/account`;
  private http = inject(HttpClient);
  userId = signal<number | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('userId');
    if (savedUser) {
      this.userId.set(Number(savedUser));
    }
  }

  async login(username: string, password: string): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
        tap((response) => {
          localStorage.setItem('userId', response.userId.toString());
          this.userId.set(response.userId); // <-- set the signal
        })
      )
    );
  }

  logout() {
    localStorage.removeItem('userId');
    this.userId.set(null); // <-- reset the signal
  }
}

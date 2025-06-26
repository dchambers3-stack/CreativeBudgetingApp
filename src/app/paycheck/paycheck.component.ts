import {
  Component,
  computed,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { PaycheckService } from '../services/paycheck.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paycheck } from '../../models/paycheck.type';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-paycheck',
  templateUrl: './paycheck.component.html',
  imports: [DatePipe, FormsModule, CurrencyPipe],
  styleUrls: ['./paycheck.component.css'],
})
export class PaycheckComponent implements OnInit {
  paychecks = signal<Paycheck[]>([]);

  payDate: string = '';
  amount: number = 0;
  paycheckService = inject(PaycheckService);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loginService = inject(LoginService);

  currentUserId = computed(() => this.loginService.userId());

  ngOnInit(): void {
    console.log(this.paychecksInfo.value());
  }

  // loadPaychecks(): void {
  //   this.paycheckService.getPaychecks(this.currentUserId() ?? 0).subscribe({
  //     next: (data) => this.paychecks.set(data),

  //     error: (err) => console.error('Error loading paychecks', err),
  //   });
  // }

  paychecksInfo = resource({
    loader: () => this.paycheckService.getPaychecks(this.currentUserId() ?? 0),
  });

  async addPaycheck(): Promise<void> {
    try {
      if (!this.payDate || isNaN(new Date(this.payDate).getTime())) {
        this.errorMessage.set('Please enter a valid pay date.');
        setTimeout(() => {
          this.errorMessage.set(null);
        }, 4000);
        return;
      }

      if (!this.amount || this.amount <= 0) {
        this.errorMessage.set('Please enter a valid paycheck amount.');
        setTimeout(() => {
          this.errorMessage.set(null);
        }, 4000);
        return;
      }
      const newPaycheck: Paycheck = {
        id: 0,
        userId: this.currentUserId() ?? 0,
        payDate: this.payDate,
        amount: this.amount,
        expenses: [],
        paycheck1: 0,
        paycheck2: 0,
      };

      await this.paycheckService.createPaycheck(
        this.currentUserId() ?? 0,
        newPaycheck
      );
    } catch (error) {
      this.errorMessage.set('Error creating paycheck: ' + error);
      console.error('Error creating paycheck', error);
    } finally {
      this.paychecksInfo.reload();
      this.successMessage.set('Paycheck created successfully!');
      setTimeout(() => {
        this.successMessage.set(null);
      }, 4000);
      this.payDate = '';
      this.amount = 0;
    }
  }
  async deletePaycheck(id: number): Promise<void> {
    try {
      await this.paycheckService.deletePaycheck(id);
    } catch (error) {
      console.error('Error deleting paycheck', error);
    }
  }
}

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
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Paycheck } from '../../models/paycheck.type';
import { LoginService } from '../services/login.service';
declare var bootstrap: any;

@Component({
  selector: 'app-paycheck',
  templateUrl: './paycheck.component.html',
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  styleUrls: ['./paycheck.component.css'],
})
export class PaycheckComponent {
  private fb = inject(FormBuilder);
  paycheckService = inject(PaycheckService);
  loginService = inject(LoginService);
  paychecks = signal<Paycheck[]>([]);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  currentUserId = computed(() => this.loginService.userId());
  private deletePaycheckIdTemp: number | null = null;

  paycheck = this.fb.group({
    payDate: ['', Validators.required],
    amount: [0, Validators.required],
  });

  paychecksInfo = resource({
    loader: () => this.paycheckService.getPaychecks(this.currentUserId() ?? 0),
  });

  async addPaycheck(): Promise<void> {
    const formValue = this.paycheck.value;
    if (!formValue.payDate || isNaN(new Date(formValue.payDate).getTime())) {
      this.errorMessage.set('Please enter a valid pay date.');
      setTimeout(() => this.errorMessage.set(null), 4000);
      return;
    }
    if (!formValue.amount || formValue.amount <= 0) {
      this.errorMessage.set('Please enter a valid paycheck amount.');
      setTimeout(() => this.errorMessage.set(null), 4000);
      return;
    }
    const newPaycheck: Paycheck = {
      id: 0,
      userId: this.currentUserId() ?? 0,
      payDate: formValue.payDate,
      amount: formValue.amount,
      paycheck1: 0,
      paycheck2: 0,
      totalBalance: 0,
    };
    try {
      await this.paycheckService.createPaycheck(
        this.currentUserId() ?? 0,
        newPaycheck
      );
      this.paychecksInfo.reload();
      this.successMessage.set('Paycheck created successfully!');
      setTimeout(() => this.successMessage.set(null), 4000);
      this.paycheck.reset();
    } catch (error) {
      this.errorMessage.set('Error creating paycheck: ' + error);
      console.error('Error creating paycheck', error);
    }
  }

  async deletePaycheck(id: number): Promise<void> {
    try {
      await this.paycheckService.deletePaycheck(id);
    } catch (error) {
      console.error('Error deleting paycheck', error);
    }
  }

  private deletePaycheckModal: any;

  openDeletePaycheckModal(paycheckId: number) {
    this.deletePaycheckIdTemp = paycheckId;

    const modalElement = document.getElementById('deletePaycheckModal');
    if (modalElement) {
      this.deletePaycheckModal = new bootstrap.Modal(modalElement);
      this.deletePaycheckModal.show();
    }
  }

  async deletePaycheckConfirm(): Promise<void> {
    if (this.deletePaycheckIdTemp !== null) {
      try {
        await this.paycheckService.deletePaycheck(this.deletePaycheckIdTemp);

        // ✅ Close the modal AFTER success
        if (this.deletePaycheckModal) {
          this.deletePaycheckModal.hide();
        }

        // ✅ Also refresh your paychecks list if needed
        // this.loadPaychecks();
      } catch (err) {
        console.error('Error deleting paycheck', err);
      } finally {
        this.paychecksInfo.reload();
      }
    }
  }
}

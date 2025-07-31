import { CommonModule } from '@angular/common';
import { Component, effect, inject, resource } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HelpdeskService } from '../services/helpdesk.service';
import { Router } from '@angular/router';
import { LookupsService } from '../services/lookups.service';

@Component({
  selector: 'app-create-ticket',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.css',
})
export class CreateTicketComponent {
  helpdeskService = inject(HelpdeskService);
  lookupsService = inject(LookupsService);
  fb = inject(FormBuilder);
  router = inject(Router);

  ticketForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    ticketSeverityId: ['', Validators.required],
    message: ['', [Validators.required]],
  });

  async submitTicket() {
    try {
      const formValue = this.ticketForm.value;
      const ticket = {
        id: 0,
        name: formValue.name ?? '',
        email: formValue.email ?? '',
        subject: formValue.subject ?? '',
        ticketSeverityId: Number(formValue.ticketSeverityId) || 0,
        message: formValue.message ?? '',
      };
      await this.helpdeskService.createTicket(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      this.ticketForm.reset();
      this.router.navigate(['/dashboard']);
    }
  }
  constructor() {
    effect(() => {
      console.log('Severities loaded:', this.ticketSeverities.value());
    });
  }

  ticketSeverities = resource({
    loader: async () => this.lookupsService.getTicketSeverities(),
  });
}

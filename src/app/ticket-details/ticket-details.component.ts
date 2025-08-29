import { Component, computed, effect, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelpdeskService } from '../services/helpdesk.service';
import { HelpdeskTicket } from '../../models/helpdesk-ticket.type';
import { NgClass } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { TicketReplyDto } from '../../models/ticket-reply-dto';
import { ProfanityFilterService } from '../services/profanity-filter.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css'],
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
})
export class TicketDetailsComponent {
  private route = inject(ActivatedRoute);
  private helpdeskService = inject(HelpdeskService);
  private profanityFilter = inject(ProfanityFilterService);
  fb = inject(FormBuilder);
  ticketId = computed(() => this.route.snapshot.paramMap.get('id'));

  formGroup = this.fb.group({
    message: [''],
  });

  // Add computed for live profanity preview
  messagePreview = computed(() => {
    const message = this.formGroup.controls.message.value;
    if (!message) return '';

    return this.profanityFilter.clean(message);
  });

  hasProfanity = computed(() => {
    const message = this.formGroup.controls.message.value;
    if (!message) return false;

    return this.profanityFilter.isProfane(message);
  });

  // Add computed properties for filtering ticket display content
  filteredSubject = computed(() => {
    const subject = this.ticketDetails.value()?.subject;
    if (!subject) return 'Not set';
    return this.profanityFilter.clean(subject);
  });

  filteredMessage = computed(() => {
    const message = this.ticketDetails.value()?.message;
    if (!message) return 'Not set';
    return this.profanityFilter.clean(message);
  });

  ticketDetails = resource({
    request: () => this.ticketId(),
    loader: ({ request }): Promise<HelpdeskTicket> => {
      return this.helpdeskService.getTicketDetails(request);
    },
  });

  constructor() {
    effect(() => {
      console.log('Ticket ID:', this.ticketId());
      console.log('Ticket Details:', this.ticketDetails.value());

      // Fetch ticket details using the id
    });
  }

  getTicketSeverityColorClasses() {
    const severity = this.ticketDetails.value()?.ticketSeverityId;
    switch (severity) {
      case 1:
        return 'text-success';
      case 2:
        return 'text-warning';
      case 3:
        return 'text-danger';
      case 4:
        return 'text-info';
      default:
        return '';
    }
  }
  async resolveTicket(): Promise<void> {
    try {
      await this.helpdeskService.resolveTicket(Number(this.ticketId()));
    } catch (error) {
      console.error('Error resolving ticket:', error);
      // Handle error (e.g., show an error message)
    } finally {
      this.ticketDetails.reload();
    }
  }
  async unresolveTicket(): Promise<void> {
    try {
      await this.helpdeskService.unresolveTicket(Number(this.ticketId()));
    } catch (error) {
      console.error('Error unresolving ticket:', error);
      // Handle error (e.g., show an error message)
    } finally {
      this.ticketDetails.reload();
    }
  }

  sendReply() {
    if (this.formGroup.controls.message?.value?.trim()) {
      const originalMessage = this.formGroup.controls.message.value;

      // Validate and filter profanity
      const validation = this.profanityFilter.validateAndClean(
        originalMessage,
        {
          allowMildProfanity: true,
          blockSevereProfanity: false,
          showWarnings: true,
        }
      );

      // Show warnings if profanity was detected
      if (validation.warnings.length > 0) {
        const warningMessage = validation.warnings.join('\n');
        const proceed = confirm(
          `${warningMessage}\n\nDo you want to send the filtered message?`
        );
        if (!proceed) {
          return;
        }
      }

      // If message is not valid (severe profanity), block sending
      if (!validation.isValid) {
        alert(
          'Your message contains inappropriate language and cannot be sent. Please revise your message.'
        );
        return;
      }

      const ticketId = this.route.snapshot.params['id'];
      const ticketEmail = this.ticketDetails.value()?.email;

      // Validate that we have the ticket email
      if (!ticketEmail) {
        alert(
          'Error: Ticket email address not found. Please refresh the page and try again.'
        );
        console.error('Ticket email is missing:', this.ticketDetails.value());
        return;
      }

      const reply = {
        Message: validation.cleanedMessage, // Use the filtered message
        Timestamp: new Date().toISOString(),
        Address: ticketEmail,
      };

      console.log('Sending reply:', reply);
      console.log('Ticket ID:', ticketId);
      if (validation.hasProfanity) {
        console.log('Original message contained profanity and was filtered');
      }

      this.helpdeskService.sendTicketReply(ticketId, reply).subscribe({
        next: (response) => {
          console.log('Reply sent successfully', response);
          this.formGroup.reset();

          let successMessage = 'Reply sent successfully!';
          if (validation.hasProfanity) {
            successMessage +=
              '\n\nNote: Inappropriate language was automatically filtered from your message.';
          }
          alert(successMessage);
        },

        error: (error) => {
          console.error('Error sending reply', error);
          console.error('Error details:', error.error);
          console.error('Error message:', error.message);
          alert(
            `Error sending reply: ${error.error?.message || error.message}`
          );
        },
      });
    }
  }
}

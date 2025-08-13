export type HelpdeskTicket = {
  id: number;
  name: string;
  email: string;
  subject: string;
  ticketSeverityId: number;
  message: string;
  ticketSeverityName?: string;
  isResolved?: boolean;
};

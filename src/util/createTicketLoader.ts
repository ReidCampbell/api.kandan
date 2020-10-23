import DataLoader from 'dataloader';
import { Ticket } from '../entities/Ticket';

export const createTicketLoader = () =>
  new DataLoader<number, Ticket>(async ticketIds => {
    const tickets = await Ticket.findByIds(ticketIds as number[]);
    const ticketIdToTicket: Record<number, Ticket> = {};

    tickets.forEach(p => {
      ticketIdToTicket[p.id] = p;
    });

    return ticketIds.map(ticketId => ticketIdToTicket[ticketId]);
  });

import { TICKET_DTO } from "../dto/ticket.dto.js"

export default class TicketRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTicket(ticket) {
        let ticketDBFormat = await TICKET_DTO.ticket(ticket);
        return await this.dao.addTicket(ticketDBFormat);
    }
}
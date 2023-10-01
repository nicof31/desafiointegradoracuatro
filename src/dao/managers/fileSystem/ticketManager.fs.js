import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import moment from "moment/moment.js";

export default class TicketManagerFs {
    constructor(path) {
        this.path = "src/files/tickets.json";
    }

    addTicket = async (ticket) => {
        try {
        ticket.code = uuidv4();
        ticket.purchase_datetime = new Date();
        const data = await fs.promises.readFile(this.path, "utf-8");
        const tickets = JSON.parse(data);
        tickets.push(ticket);
        await fs.promises.writeFile(this.path, JSON.stringify(tickets, null, 2));
        return ticket;
        } catch (error) {
        return { error: error.message };
        }
    }
}

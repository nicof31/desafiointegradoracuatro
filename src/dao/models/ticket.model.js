import mongoose from "mongoose";
import moment from "moment/moment.js";


const ticketsCollection = "tickets";

const ticketsSchema =  new mongoose.Schema({
  code: { type: String, require: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, require: true },
  purchaser: { type: String, require: true },
});


const ticketModel = mongoose.model(ticketsCollection, ticketsSchema);

export default ticketModel

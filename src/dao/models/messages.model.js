import mongoose from "mongoose";

const messagesCollection = 'messages';

const messagesSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    idUser: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
});

const messagesModel = mongoose.model(messagesCollection, messagesSchema);

export default messagesModel;

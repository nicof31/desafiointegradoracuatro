import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default class MessagesManagerFs {
    constructor() {
    this.path = "src/files/messages.json";
    }

    sendMessages = async (req) => {
        try {
            const dataMessage = await fs.promises.readFile(this.path, 'utf-8');
            const messages = JSON.parse(dataMessage);
            const messageNew = req.body.message;
            console.log("🚀 ~ file: messageManager.fs.js:15 ~ MessagesManagerFs ~ sendMessages= ~ messageNew:", messageNew)
            const { email, id } = req.user; 
            const newMessage = {
                _id: uuidv4(),
                email,
                idUser: id,
                message: messageNew,
                timestamp: new Date().toISOString()
            };
            console.log("🚀 ~ file: messageManager.fs.js:24 ~ MessagesManagerFs ~ sendMessages= ~ newMessage :", newMessage )
            messages.push(newMessage);
            await fs.promises.writeFile(this.path, JSON.stringify(messages, null, 2));
            return newMessage;
        } catch (error) {
            throw error;
        }
    }

    getMessages = async (userEmail) => {
        try {
            const dataMessage = await fs.promises.readFile(this.path, 'utf-8');
            const messages = JSON.parse(dataMessage);
            const userMessages = messages.filter(message => message.email === userEmail);
            console.log("🚀 ~ file: messageManager.fs.js:44 ~ MessagesManagerFs ~ getMessages= ~ userMessages:", userMessages)
            return userMessages;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

}

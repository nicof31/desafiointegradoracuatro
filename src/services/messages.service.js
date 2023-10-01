import { MESSAGES_REPOSITORY } from "../repository/respositoryManager.js";

class MessagesService {
    constructor(){
        this.messagesRepository = MESSAGES_REPOSITORY;
    }
    
    sendMessages = async (req) => {
        try {
            const sendNewMessages  = await this.messagesRepository.sendMessages(req);
            return sendNewMessages ;
        } catch(error) {
            console.log(`messageService: Error proceso message: ${error}`);
            throw error; 
        };
    }

    getMessages = async (userEmail) => {
        try {
            const getMessages  = await this.messagesRepository.getMessages(userEmail);
            return getMessages ;
            } catch(error) {
            console.log(`messageService: Error proceso message: ${error}`);
            throw error; 
        };
    }

}

export default MessagesService;
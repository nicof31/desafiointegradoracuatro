import messagesModel from "../../models/messages.model.js";

export default class MessageManagerMongo {
  constructor() {
    this.messagesModel = messagesModel;
  }

  sendMessages = async (req) => {
    try {
      const messageNew = req.body.message;
      const { email, id } = req.user;
      const messageData = {
        email,
        idUser: id,
        message: messageNew,
      };
      const newMessage = new messagesModel(messageData);
      await newMessage.save();
      console.log("Mensaje guardado correctamente:", newMessage);
      return newMessage;
    } catch (error) {
      console.error(`Error al guardar el mensaje: ${error}`);
      throw error;
    }
  };

  getMessages = async (userEmail) => {
    try {
      const messages = await messagesModel.find({ email: userEmail });
      console.log("Mensajes obtenidos:", messages);
      return messages;
    } catch (error) {
      console.error(`Error al obtener los mensajes: ${error}`);
      throw error;
    }
  };
  
}

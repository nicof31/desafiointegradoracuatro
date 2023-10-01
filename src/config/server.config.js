import express from "express";
import handlebars from "express-handlebars";
import { io } from "../app.js";
import passport from "passport";
import cors from "cors";
import __dirname from "../utils.js";
import cookieParser from "cookie-parser";
import { addLogger } from "../utils/logger.js";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { swaggerOpts } from "./swagger.config.js";
import uploadRoutes from "../routes/uploadfiles.routes.js";
import viewsRoutes from "../routes/views.routes.js";
import sessionRoutes from "../routes/session.routes.js";
import cartRoutes from "../routes/carts.routes.js";
import productRoutes from "../routes/products.routes.js";
import emailRoutes from "../routes/email.routes.js";
import smsRoutes from "../routes/sms.routes.js";
import messageRoutes from "../routes/message.routes.js";
import mockingRoutes from "../routes/mocking.routes.js"
import loggerRoutes from "../routes/logger.routes.js"

class ServerConfig {
  constructor(app, httpServer) {
    this.app = app;
    this.httpServer = httpServer; 
  }

  configure() {
    this.configureExpress();
    this.configureRoutes();
    this.iniciarWebsoket();
  }

  configureExpress() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(`${__dirname}/public`));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
    
    this.app.use(addLogger);
    this.app.engine("handlebars", handlebars.engine());
    this.app.set("views", `${__dirname}/views`);
    this.app.set("view engine", "handlebars");
  }

  configureRoutes() {
    console.log("Configuración de rutas correcta...");
    this.app.use("/", viewsRoutes);
    this.app.set("products", `${__dirname}/api`);
    this.app.set("product engine", "handlebars");
    this.app.use("/api/upload/", uploadRoutes);
    this.app.use("/api/session/", sessionRoutes);
    this.app.use("/api/carts/", cartRoutes);
    this.app.use("/api/products/", productRoutes);
    this.app.use("/api/email", emailRoutes);
    this.app.use("/api/sms", smsRoutes);
    this.app.use("/api/messages", messageRoutes);
    this.app.use("/api/mockingproducts", mockingRoutes);
    this.app.use("/api/logger", loggerRoutes);
    
    const specs = swaggerJsdoc(swaggerOpts);
    this.app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
  }

  
  iniciarWebsoket() {
    const ioS = io
    //const io = new Server(this.httpServer);

    ioS.on("connection", (socketClient) => {
      console.log(`Cliente conectado por socket: ${socketClient.id}`);
      socketClient.on("message", (data) => {
        console.log(data);
      });
      socketClient.emit("evento_para_mi_usuario", "Actualización de datos");
      socketClient.broadcast.emit(
        "evento_para_todos_menos_el_actual",
        "Actualización de datos"
      );
      ioS.emit("evento_para_todos", "Actualización de datos global");
    });

    const messages = [];
    ioS.on("connection", (socket) => {
      console.log("Nuevo cliente conectado");

      socket.on("message", (dataM) => {
        messages.push(dataM);
        ioS.emit("messageLogs", messages);
        /*
        const message = new messagesModel(dataM);
        message
          .save()
          .then(() => {
            console.log("Mensaje guardado en la base de datos");
          })
          .catch((error) => {
            console.log(
              "Error al guardar el mensaje en la base de datos: " + error
            );
          });*/
      });

      socket.on("authenticated", (data) => {
        socket.emit("messageLogs", messages);
        socket.broadcast.emit("newUserConected", data);
      });
    });
  }

}




export default ServerConfig;
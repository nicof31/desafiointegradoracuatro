import mongoose from "mongoose";
import { appConfig } from "./config.js";
const { DB_URL } = appConfig;
import dotenv from "dotenv";

export default class MongoDbConnection {
    static #instance;
    constructor() {
        dotenv.config();
        mongoose.connect(DB_URL);
    }

    static getConnection() {
        try {
        if (this.#instance) {
            console.log(`Ya existe la conexion`);
            return this.#instance;
        }
        this.#instance = new MongoDbConnection();
        console.log("Base de datos MongoDB Atlas conectada");
        } catch (error) {
        console.log(`Base de datos no conectada: ${error}`)
        }
    }
    }



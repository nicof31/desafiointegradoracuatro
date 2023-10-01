import ProductRepository from "./product.repository.js";
import CartRepository from "./cart.repository.js";
import SessionRepository from "./session.repository.js";
import MessagesRepository from "./messages.respository.js";
import {PRODUCT_DAO , CART_DAO , USER_DAO, MESSAGE_DAO} from "../dao/persistenceFactory.js";

const PRODUCT_REPOSITORY = new ProductRepository(PRODUCT_DAO);
const CART_REPOSITORY = new CartRepository(CART_DAO);
const SESSION_REPOSITORY = new SessionRepository(USER_DAO);
const MESSAGES_REPOSITORY = new MessagesRepository(MESSAGE_DAO);

export { PRODUCT_REPOSITORY, CART_REPOSITORY, SESSION_REPOSITORY, MESSAGES_REPOSITORY }
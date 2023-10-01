import mongoose from 'mongoose';
import chai from 'chai';
import supertest from 'supertest';
import { appConfig } from "../src/config/config.js";
import UserModel from '../src/dao/models/users.model.js';
import cartsModel from '../src/dao/models/carts.model.js';
import Jwt from 'jsonwebtoken';


const { DB_URL, SECRET_JWT } = appConfig;
const expect = chai.expect;
const requester = supertest('http://localhost:8080/');

function extractCookieData(tokenProces) {
  const token = tokenProces; 
  const decodedToken = Jwt.decode(token);
  return decodedToken.user;
}

describe('Testing User/Session Router', () => {
    before(async function() {
      await mongoose.connect(DB_URL); 
      this.timeout(5000); 
    })

    afterEach(async function() {
      const newUser = await UserModel.findOne({ email: 'coderPremiumDos@gmail.com' });
      if (newUser) {
        const cartUserReg = newUser.cart;
        if (mongoose.Types.ObjectId.isValid(cartUserReg)) {
          await cartsModel.deleteOne({ _id: cartUserReg });
        } else {
          console.error('ID del carrito no válido');
        }
        await UserModel.deleteOne({ email: 'coderPremiumDos@gmail.com' });
      }
    });
  
    after(async function() {
      await mongoose.disconnect(); 
    });

    
let tokenCookie;
let oldUser;
  
  it('1. POST /api/session/login exitosa con usuario válido', async () => {
    let credentialsMock = {
      email: 'userCoder@coder.com',
      password: 'userCod3r123',
    };
    const { statusCode, body, header } = await requester
      .post('api/session/login')
      .send(credentialsMock);

    expect(statusCode).to.be.eql(302);
    expect(typeof body, 'object').to.be.ok;
    expect(body.errorCode).to.be.undefined;

    tokenCookie = header['set-cookie'];
    let tokenCookieString = tokenCookie.join(';');
    expect(tokenCookieString).to.include('ecommerceCookieToken');
  });

  it('2. POST /api/session/login Error de autenticación con contraseña incorrecta', async () => {
    let credentialsMock = {
      email: 'userCoder@coder.com',
      password: 'userCod3r144', 
    };
    const { statusCode, body } = await requester
      .post('api/session/login')
      .send(credentialsMock);

    expect(statusCode).to.be.eql(401); 
    expect(body.statusMessage).to.be.eql('UNAUTHORIZED ERROR - Credenciales inválidas');
  });

  it('3. POST /api/session/login Error de autenticación con usuario inexistente', async () => {
    let credentialsMock = {
      email: 'pruebaNoCoder@coder.com', 
      password: 'pruebaNoCod3r123',
    };
    const { statusCode, body } = await requester
      .post('api/session/login')
      .send(credentialsMock);

    expect(statusCode).to.be.eql(401); 
    expect(body.statusMessage).to.be.eql('UNAUTHORIZED ERROR - Credenciales inválidas');
  });
  
  it('4. POST /api/session/register Registro exitoso de usuario PREMIUM', async function () {
    this.timeout(10000);
    const userData = {
      first_name: 'Premium Dos',
      last_name: 'Premium Dos',
      email: 'coderPremiumDos@gmail.com',
      age: 37,
      password: '123456',
      role: 'PREMIUM'
    };
    const { statusCode, body } = await requester
      .post('api/session/register')
      .send(userData);
    expect(statusCode).to.be.eql(302);
    expect(body.errorCode).to.be.undefined;    
  });

  it('5. POST /api/session/register Intento de registro con correo electrónico existente', async function () {
    this.timeout(10000);
    const duplicateUserData = {
      first_name: 'Usuario Duplicado',
      last_name: 'Duplicado',
      email: 'coderPremiumDos@gmail.com', 
      age: 35,
      password: '654321',
      role: 'USER'
    };
      const { statusCode, body } = await requester
      .post('api/session/register')
      .send(duplicateUserData);
    expect(statusCode).to.be.eql(302);
    expect(body.errorCode).to.be.undefined;
  });


  it('6. GET /api/session/current después de la autenticación', async () => {
    let credentialsMock = {
      email: 'userCoder@coder.com',
      password: 'userCod3r123',
    };
    const response = await requester
      .post('api/session/login')
      .send(credentialsMock);
    expect(response.statusCode).to.be.eql(302);
    const tokenCookie = response.headers['set-cookie'][0]; 
    const tokenProces = tokenCookie.match(/ecommerceCookieToken=([^;]*)/)[1]; 
    const cookieData = extractCookieData(tokenProces);
    await requester
      .get('/api/session/current')
      .set("Cookie", tokenCookie);
    expect(cookieData).to.have.property('first_name', cookieData.first_name);
    expect(cookieData).to.have.property('last_name', cookieData.last_name);
    expect(cookieData).to.have.property('email', cookieData.email);
    expect(cookieData).to.have.property('role', cookieData.role);
  });

});





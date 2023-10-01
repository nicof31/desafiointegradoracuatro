import mongoose from 'mongoose';
import chai from 'chai';
import supertest from 'supertest';
import { appConfig } from "../src/config/config.js";
import productsModel from '../src/dao/models/products.model.js';
import cartsModel from '../src/dao/models/carts.model.js';

const { DB_URL } = appConfig;
const expect = chai.expect;
const requester = supertest('http://localhost:8080/');

describe("Endpoints Carts", () => {
    let cookie; 

    before(async function () {
        await mongoose.connect(DB_URL);
        this.timeout(5000);
    });
    
    after(async function () {
    const usersToLogout = [
            "adminCoder@coder.com",
            "coderPremium@gmail.com",
            "userTester@gmail.com",
            "publicUser@gmail.com"
        ];
        for (const user of usersToLogout) {
            await requester.post('api/session/logout').send({ email: user });
        }
        await mongoose.disconnect();
    });

    describe("Test:", () => {
        let pid = 2;
        let cid = "64dab5f1c45a31639586fbcc";
        before(async () => {
            let userPuser = {
                "email": "userCoder@coder.com",
                "password": "userCod3r123"
            };

            const result = await requester.post('api/session/login').send(userPuser);
            const cookieResult = result.headers['set-cookie'][0];
            expect(cookieResult).to.be.ok;
            const cookieResultSplit = cookieResult.split('=');
            cookie = {
                name: cookieResultSplit[0],
                value: cookieResultSplit[1]
            };

            expect(cookie.name).to.be.ok.and.equal('ecommerceCookieToken');
            expect(cookie.value).to.be.ok;
        });

        it('1. GET api/carts/ Obtiene una lista de todos los carts', async () => {
            const { statusCode, body } = await requester.get('api/carts/').set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data).to.have.property('carts');
            expect(body.data.carts).to.be.an('array');
        });

        it('2. GET api/carts/:cid Buscar un carrito por su ID', async () => {
            const { statusCode, body } = await requester.get(`api/carts/${cid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
        });
        
        it('3. GET api/carts/:cid Cart no existe en la BBDD', async () => {
            const cid = 'carrito_inexistente';
            const { statusCode, body } = await requester.get(`api/carts/${cid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(404);
            expect(typeof body).to.be.eql('object');
            expect(body).to.have.property('data');
            expect(body.data).to.have.property('error');
        });

        it('4. POST api/carts/:pid/?accion=aumentar Agregar dos productos al carrito', async () => {
            const pidUno = 1;
            const pidDos = 2;
            let { statusCode, body } = await requester
                .post(`api/carts/${pidUno}/?accion=aumentar`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(201);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('status');
            expect(body.data.payload.status).to.be.eql('success');
            expect(body.data.payload).to.have.property('message');
            expect(body.data.payload.message).to.be.eql('Cantidad aumentar en el carrito');
        
            ({ statusCode, body } = await requester
                .post(`api/carts/${pidDos}/?accion=aumentar`)
                .set('Cookie', `${cookie.name}=${cookie.value}`));
            expect(statusCode).to.be.eql(201);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('status');
            expect(body.data.payload.status).to.be.eql('success');
            expect(body.data.payload).to.have.property('message');
            expect(body.data.payload.message).to.be.eql('Cantidad aumentar en el carrito');
        });

        it('5. PUT api/carts/:cid/products/:pid Modificar un parámetro de un producto en el carrito', async () => {
            pid = 1; 
            const updateData = {
                "quantity": 4
            };
            const { statusCode, body } = await requester
                .put(`api/carts/${cid}/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(200);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('_id');
            expect(body.data.payload).to.have.property('products');
            
            const updatedProduct = body.data.payload.products[0];
            expect(updatedProduct.product).to.be.eql(pid);
            expect(updatedProduct.quantity).to.be.eql(updateData.quantity);
            expect(updatedProduct).to.have.property('stock');
            expect(updatedProduct).to.have.property('price');
            expect(updatedProduct).to.have.property('totalPrice');
            expect(updatedProduct).to.have.property('_id');
            
            expect(body.data.payload).to.have.property('totalCartPrice');
            expect(body.data.payload).to.have.property('user');
            expect(body.data.payload).to.have.property('__v');
        });

        it('6. PUT api/carts/:cid Modificar el carrito completo', async () => {
            const updateData = [
                {
                    "product": 1,
                    "quantity": 3,
                    "stock": 10,
                    "price": 350,
                    "totalPrice": 1050
                },
                {
                    "product": 2,
                    "quantity": 2,
                    "stock": 10,
                    "price": 350,
                    "totalPrice": 700
                }
            ];
        
            const { statusCode, body } = await requester
                .put(`api/carts/${cid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(201);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('_id');
            expect(body.data.payload).to.have.property('products');
            expect(body.data.payload.products).to.be.an('array').that.has.lengthOf(2);
            
            for (const updatedProduct of body.data.payload.products) {
                const matchingData = updateData.find(data => data.product === updatedProduct.product);
                expect(updatedProduct.quantity).to.be.eql(matchingData.quantity);
                expect(updatedProduct.stock).to.be.eql(matchingData.stock);
                expect(updatedProduct.price).to.be.eql(matchingData.price);
                expect(updatedProduct.totalPrice).to.be.eql(matchingData.totalPrice);
                expect(updatedProduct).to.have.property('_id');
            }
            
            expect(body.data.payload).to.have.property('totalCartPrice');
            expect(body.data.payload).to.have.property('user');
            expect(body.data.payload).to.have.property('__v');
        });
        
        
        it('7. DELETE api/carts/:cid/products/:pid Eliminar un producto del carrito', async () => {
            const { statusCode, body } = await requester
                .delete(`api/carts/${cid}/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('_id');
            expect(body.data.payload).to.have.property('products');
            expect(body.data.payload).to.have.property('totalCartPrice');
            expect(body.data.payload).to.have.property('user');
            expect(body.data.payload).to.have.property('__v');
            expect(body.data.payload.products).to.be.an('array');
        });
        
        it('8. DELETE api/carts/:cid Eliminar todos los productos del carrito', async () => {
            const { statusCode, body } = await requester
                .delete(`api/carts/${cid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('_id');
            expect(body.data.payload).to.have.property('products');
            expect(body.data.payload.products).to.be.an('array').that.is.empty;
            expect(body.data.payload).to.have.property('totalCartPrice');
            expect(body.data.payload.totalCartPrice).to.be.eql(0);
            expect(body.data.payload).to.have.property('user');
            expect(body.data.payload).to.have.property('__v');
        });
        
        it('10. POST api/carts/:cid/purchase Realizar la compra', async () => {
            const { statusCode, body } = await requester
                .post(`api/carts/${cid}/purchase`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
            
            expect(statusCode).to.be.eql(200);
            expect(typeof body).to.be.eql('object');
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body).to.have.property('data');
            expect(body.data).to.be.an('object');
            expect(body.data).to.have.property('payload');
            expect(body.data.payload).to.be.an('object');
            expect(body.data.payload).to.have.property('message');
            expect(body.data.payload).to.have.property('productsNotPurchased');
            expect(Array.isArray(body.data.payload.productsNotPurchased)).to.be.true;
        });
        
    })

})

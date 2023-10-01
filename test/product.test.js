import mongoose from 'mongoose';
import chai from 'chai';
import supertest from 'supertest';
import { appConfig } from "../src/config/config.js";
import productsModel from '../src/dao/models/products.model.js';

const { DB_URL } = appConfig;
const expect = chai.expect;
const requester = supertest('http://localhost:8080/');

describe("Endpoints Products: Pruebas por roles", () => {
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

    describe("ADMIN Role", () => {
        let pid = 2;

        before(async () => {
            const userPadmin = {
                "email": "adminCoder@coder.com",
                "password": "adminCod3r123"
            };

            const result = await requester.post('api/session/login').send(userPadmin);
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

        it('1. GET api/products/?page=&limit=&sort=&id= Obtiene una lista de productos con opciones de filtrado y paginación', async () => {
            const { statusCode, body } = await requester.get('api/products/?page=1&limit=5&sort=&id=').set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.productsPagination.docs)).to.be.ok;
        });

        it('2. GET api/products/:pid Obtener un producto por su ID', async () => {
            const { statusCode, body } = await requester.get(`api/products/${pid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.product)).to.be.ok;

            const product = body.data.product[0];
            expect(product._id).to.be.eql(pid);
            expect(product.title).to.be.eql('Producto 2');
            expect(product.description).to.be.eql('creado 2');
            expect(product.code).to.be.eql('# prueba ID 2');
            expect(product.price).to.be.eql(1500);
            expect(product.status).to.be.true;
            expect(product.category).to.be.eql('notebooks');
            expect(Array.isArray(product.thumbnail)).to.be.true;
            expect(product.stock).to.be.eql(994);
            expect(typeof product.owner).to.be.eql('string');
            expect(product.__v).to.be.eql(0);
        });

        it('3. GET api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; // Suponiendo un _id que no existe
            const { statusCode, body } = await requester
                .get(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
            expect(body.data.error).to.include('El _id');
        });
        
        it('4. POST api/products/ Crear un producto ', async () => {
            const productData = {
                "title": "Producto Prueba ADMIN",
                "description": "Prueba ADMIN",
                "code": "# Prueba ADMIN",
                "price": 1500,
                "status": true,
                "category": "notebooks",
                "thumbnail": ["creado ","creado  2"],
                "stock": 1000
            };
    
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(productData);
            expect(statusCode).to.be.eql(201);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data.payload.status).to.be.eql('success');
            expect(body.data.payload.message).to.be.eql('productManager: Producto creado exitosamente');
        });

        it('5. POST api/products/ Parámetros incompletos', async () => {
            const incompleteProductData = {
                // Falta el campo "Title" y "Description"
                "code": "# Parámetros Incompletos",
                "price": 1500,
                "status": true,
                "category": "notebooks",
                "thumbnail": ["creado ","creado  2"],
                "stock": 1000
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(incompleteProductData);
        
            expect(statusCode).to.be.eql(400);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('validation error');
            expect(Array.isArray(body.data.error)).to.be.ok;
            expect(body.data.error).to.include('"Title" es un campo requerido');
            expect(body.data.error).to.include('"Description" es un campo requerido');
        });

        it('6. POST api/products/ Código de producto asignado en otro producto', async () => {
            const duplicateCodeProductData = {
                "title": "Producto Duplicado",
                "description": "Descripción Duplicada",
                "code": "# prueba ID 1", 
                "price": 2000,
                "status": true,
                "category": "tablets",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 800
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(duplicateCodeProductData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });

        it('7. PUT api/products/:pid Actualiza un producto por su ID (completo)', async () => {
            const product = await productsModel.findOne({ code: '# Prueba ADMIN' });
            const productId = product._id.toString();
            const updateData = {
                "title": "prueba prueba put ADMIN",
                "description": "prueba prueba put ADMIN",
                "code": "# Prueba ADMIN PUT",
                "price": 100,
                "status": true,
                "category": "notebooks",
                "thumbnail": [
                    "modificado put",
                    "modificado put "
                ],
                "stock": 100
            };
            const { statusCode, body } = await requester
                .put(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(201);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data.payload.title).to.be.eql(updateData.title);
            expect(body.data.payload.description).to.be.eql(updateData.description);
            expect(body.data.payload.code).to.be.eql(updateData.code);
            expect(body.data.payload.price).to.be.eql(updateData.price);
            expect(body.data.payload.status).to.be.eql(updateData.status);
            expect(body.data.payload.category).to.be.eql(updateData.category);
            expect(body.data.payload.thumbnail).to.deep.equal(updateData.thumbnail);
            expect(body.data.payload.stock).to.be.eql(updateData.stock);
        });

        it('8. PUT api/products/:pid Parámetros incompletos', async () => {
            const product = await productsModel.findOne({ code: '# Prueba ADMIN PUT' });
            const productId = product._id.toString();
            const incompleteUpdateData = {
                // Faltan los campos "title" y "description"
                "price": 2000,
                "status": true,
                "category": "tablets",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 800
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(incompleteUpdateData);
        
            expect(statusCode).to.be.eql(400);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('validation error');
            expect(body.data.error).to.deep.equal([
                "\"Title\" es un campo requerido",
                "\"Description\" es un campo requerido",
                "\"Code\" es un campo requerido"
            ]);
        });

        it('9. PUT api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const updateData = {
                "title": "prueba prueba put ADMIN",
                "description": "prueba prueba put ADMIN",
                "code": "# Prueba ADMIN PUT",
                "price": 100,
                "status": true,
                "category": "notebooks",
                "thumbnail": [
                    "modificado put",
                    "modificado put "
                ],
                "stock": 100
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });
        
        it('10. PATCH api/products/:pid Actualiza parcialmente un producto por su ID', async () => {
            const product = await productsModel.findOne({ code: '# Prueba ADMIN PUT' });
            const productId = product._id.toString();
            const partialUpdateData = {
                "title": "prueba patch ",
                "description": "modificado patch ",
                "code": "# Prueba ADMIN",
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
        
            expect(body.data.payload._id).to.be.eql(product._id);
            expect(body.data.payload.title).to.be.eql(partialUpdateData.title);
            expect(body.data.payload.description).to.be.eql(partialUpdateData.description);
            expect(body.data.payload.code).to.be.eql(partialUpdateData.code);
            expect(body.data.payload.price).to.be.eql(partialUpdateData.price); 
        });

        it('11. PATCH api/products/:pid Código de producto repetido en otro producto', async () => {
            const product = await productsModel.findOne({ code: '# Prueba ADMIN' });
            const productId = product._id.toString();
        
            const partialUpdateData = {
                "title": "prueba patch",
                "description": "modificado patch",
                "code": "# prueba ID 1", 
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });

        it('12. PATCH api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; // Suponiendo un _id que no existe
            const partialUpdateData = {
                "title": "prueba patch ",
                "description": "modificado patch ",
                "code": "# Prueba ADMIN",
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });
        
        it('13. DELETE api/products/:pid Eliminar un producto por su ID', async () => {
            const product = await productsModel.findOne({ code: '# Prueba ADMIN' });
            const productId = product._id.toString();
            const { statusCode, body } = await requester
                .delete(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data).to.be.eql('DELETE realizado exitosamente');
        });
        
        it('14. DELETE api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const { statusCode, body } = await requester
                .delete(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });
    });

    describe("PREMIUM Role", () => {
        let userPpremium = {
            "email": "coderPremium@gmail.com",
            "password": "123456"
        };
        let pid = 2;
    
        before(async () => {
            const result = await requester.post('api/session/login').send(userPpremium);
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

        it('1. GET api/products/ Usuario PREMIUM no tiene permisos', async () => {
            const { statusCode, body } = await requester.get('api/products/').set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });

        it('2. GET api/products/:pid Usuario PREMIUM no tiene permisos', async () => {
            const { statusCode, body } = await requester.get(`api/products/${pid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });

        it('3. POST api/products/ Crear un producto ', async () => {
            const productData = {
                "title": "Producto Prueba PREMIUM",
                "description": "Prueba PREMIUM",
                "code": "# Prueba PREMIUM",
                "price": 1500,
                "status": true,
                "category": "notebooks",
                "thumbnail": ["creado ","creado  2"],
                "stock": 1000
            };
    
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(productData);
            expect(statusCode).to.be.eql(201);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data.payload.status).to.be.eql('success');
            expect(body.data.payload.message).to.be.eql('productManager: Producto creado exitosamente');
        });

        it('4. POST api/products/ Parámetros incompletos', async () => {
            const incompleteProductData = {
                // Falta el campo "Title" y "Description"
                "code": "# Parámetros Incompletos",
                "price": 1500,
                "status": true,
                "category": "notebooks",
                "thumbnail": ["creado ","creado  2"],
                "stock": 1000
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(incompleteProductData);
        
            expect(statusCode).to.be.eql(400);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('validation error');
            expect(Array.isArray(body.data.error)).to.be.ok;
            expect(body.data.error).to.include('"Title" es un campo requerido');
            expect(body.data.error).to.include('"Description" es un campo requerido');
        });

        it('5. POST api/products/ Código de producto asignado en otro producto', async () => {
            const duplicateCodeProductData = {
                "title": "Producto Duplicado",
                "description": "Descripción Duplicada",
                "code": "# prueba ID 1", 
                "price": 2000,
                "status": true,
                "category": "tablets",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 800
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(duplicateCodeProductData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });

        it('6. PUT api/products/:pid Actualiza un producto por su ID (completo)', async () => {
            const product = await productsModel.findOne({ code: '# Prueba PREMIUM' });
            const productId = product._id.toString();
            const updateData = {
                "title": "prueba prueba put PREMIUM",
                "description": "prueba prueba put PREMIUM",
                "code": "# Prueba PREMIUM PUT",
                "price": 100,
                "status": true,
                "category": "notebooks",
                "thumbnail": [
                    "modificado put",
                    "modificado put "
                ],
                "stock": 100
            };
            const { statusCode, body } = await requester
                .put(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(201);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data.payload.title).to.be.eql(updateData.title);
            expect(body.data.payload.description).to.be.eql(updateData.description);
            expect(body.data.payload.code).to.be.eql(updateData.code);
            expect(body.data.payload.price).to.be.eql(updateData.price);
            expect(body.data.payload.status).to.be.eql(updateData.status);
            expect(body.data.payload.category).to.be.eql(updateData.category);
            expect(body.data.payload.thumbnail).to.deep.equal(updateData.thumbnail);
            expect(body.data.payload.stock).to.be.eql(updateData.stock);
        });

        it('7. PUT api/products/:pid Parámetros incompletos', async () => {
            const product = await productsModel.findOne({ code: '# Prueba PREMIUM PUT' });
            const productId = product._id.toString();
            const incompleteUpdateData = {
                // Faltan los campos "title" y "description"
                "price": 2000,
                "status": true,
                "category": "tablets",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 800
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(incompleteUpdateData);
        
            expect(statusCode).to.be.eql(400);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('validation error');
            expect(body.data.error).to.deep.equal([
                "\"Title\" es un campo requerido",
                "\"Description\" es un campo requerido",
                "\"Code\" es un campo requerido"
            ]);
        });

        it('8. PUT api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const updateData = {
                "title": "prueba prueba put PREMIUM",
                "description": "prueba prueba putPREMIUM",
                "code": "# Prueba PREMIUM PUT",
                "price": 100,
                "status": true,
                "category": "notebooks",
                "thumbnail": [
                    "modificado put",
                    "modificado put "
                ],
                "stock": 100
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });

        it('9. PATCH api/products/:pid Actualiza parcialmente un producto por su ID', async () => {
            const product = await productsModel.findOne({ code: '# Prueba PREMIUM PUT' });
            const productId = product._id.toString();
            const partialUpdateData = {
                "title": "prueba patch ",
                "description": "modificado patch ",
                "code": "# Prueba PREMIUM",
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
        
            expect(body.data.payload._id).to.be.eql(product._id);
            expect(body.data.payload.title).to.be.eql(partialUpdateData.title);
            expect(body.data.payload.description).to.be.eql(partialUpdateData.description);
            expect(body.data.payload.code).to.be.eql(partialUpdateData.code);
            expect(body.data.payload.price).to.be.eql(partialUpdateData.price); 
        });

        it('10. PATCH api/products/:pid Código de producto repetido en otro producto', async () => {
            const product = await productsModel.findOne({ code: '# Prueba PREMIUM' });
            const productId = product._id.toString();
        
            const partialUpdateData = {
                "title": "prueba patch",
                "description": "modificado patch",
                "code": "# prueba ID 1", 
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });

        it('11. PATCH api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const partialUpdateData = {
                "title": "prueba patch ",
                "description": "modificado patch ",
                "code": "# Prueba PREMIUM",
                "price": 100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });
        
        it('12. DELETE api/products/:pid Eliminar un producto por su ID', async () => {
            const product = await productsModel.findOne({ code: '# Prueba PREMIUM' });
            const productId = product._id.toString();
            const { statusCode, body } = await requester
                .delete(`api/products/${productId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(body.data).to.be.eql('DELETE realizado exitosamente');
        });
        
        it('13. DELETE api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const { statusCode, body } = await requester
                .delete(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
        });
    
    
    });

    describe("USER Role", () => {
        let userPuser = {
            "email": "userCoder@coder.com",
            "password": "userCod3r123"
        };
        let pid = 2;
    
        before(async () => {
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

        it('1. GET api/products/?page=&limit=&sort=&id= Obtiene una lista de productos con opciones de filtrado y paginación', async () => {
            const { statusCode, body } = await requester.get('api/products/?page=1&limit=5&sort=&id=').set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.productsPagination.docs)).to.be.ok;
        });

        it('2. GET api/products/:pid Obtener un producto por su ID', async () => {
            const { statusCode, body } = await requester.get(`api/products/${pid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.product)).to.be.ok;

            const product = body.data.product[0];
            expect(product._id).to.be.eql(pid);
            expect(product.title).to.be.eql('Producto 2');
            expect(product.description).to.be.eql('creado 2');
            expect(product.code).to.be.eql('# prueba ID 2');
            expect(product.price).to.be.eql(1500);
            expect(product.status).to.be.true;
            expect(product.category).to.be.eql('notebooks');
            expect(Array.isArray(product.thumbnail)).to.be.true;
            expect(product.stock).to.be.eql(994);
            expect(typeof product.owner).to.be.eql('string');
            expect(product.__v).to.be.eql(0);
        });

        it('3. GET api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const { statusCode, body } = await requester
                .get(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
            expect(body.data.error).to.include('El _id');
        });
    
        it('4. POST api/products/ Usuario sin permisos no puede crear un producto', async () => {
            const productData = {
                "title": "Nuevo Producto",
                "description": "Descripción del nuevo producto",
                "code": "# Nuevo Producto",
                "price": 1000,
                "status": true,
                "category": "Electrónica",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 50
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(productData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
        
        it('5. PUT api/products/:pid Usuario sin permisos no puede actualizar un producto', async () => {
            const updateData = {
                "title": "Producto Actualizado",
                "description": "Descripción actualizada",
                "code": "# Producto Actualizado",
                "price": 1200,
                "status": true,
                "category": "Electrónica",
                "thumbnail": ["nueva-imagen1", "nueva-imagen2"],
                "stock": 60
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
        
        it('6. PATCH api/products/:pid Usuario sin permisos no puede actualizar parcialmente un producto', async () => {
            const partialUpdateData = {
                "title": "Producto Modificado",
                "description": "Descripción modificada",
                "code": "# Producto Modificado",
                "price": 1100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });

        it('7. DELETE api/products/:pid Usuario sin permisos no puede eliminar un producto', async () => {
            const { statusCode, body } = await requester
                .delete(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
        
        
    
    });

    describe("PUBLIC Role", () => {
        let userPpublic = {
            "email": "publicCoder@coder.com",
            "password": "publicCod3r123"
        };
        let pid = 2;
    
        before(async () => {
            const result = await requester.post('api/session/login').send(userPpublic);
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

        it('1. GET api/products/?page=&limit=&sort=&id= Obtiene una lista de productos con opciones de filtrado y paginación', async () => {
            const { statusCode, body } = await requester.get('api/products/?page=1&limit=5&sort=&id=').set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.productsPagination.docs)).to.be.ok;
        });

        it('2. GET api/products/:pid Obtener un producto por su ID', async () => {
            const { statusCode, body } = await requester.get(`api/products/${pid}`).set('Cookie', `${cookie.name}=${cookie.value}`);
            expect(statusCode).to.be.eql(200);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('success');
            expect(Array.isArray(body.data.product)).to.be.ok;

            const product = body.data.product[0];
            expect(product._id).to.be.eql(pid);
            expect(product.title).to.be.eql('Producto 2');
            expect(product.description).to.be.eql('creado 2');
            expect(product.code).to.be.eql('# prueba ID 2');
            expect(product.price).to.be.eql(1500);
            expect(product.status).to.be.true;
            expect(product.category).to.be.eql('notebooks');
            expect(Array.isArray(product.thumbnail)).to.be.true;
            expect(product.stock).to.be.eql(994);
            expect(typeof product.owner).to.be.eql('string');
            expect(product.__v).to.be.eql(0);
        });

        it('3. GET api/products/:pid Producto no existe en la BBDD', async () => {
            const nonExistentProductId = '60'; 
            const { statusCode, body } = await requester
                .get(`api/products/${nonExistentProductId}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(404);
            expect(typeof body, "object").to.be.ok;
            expect(body.data.error).to.include('El _id');
        });
    
        it('4. POST api/products/ Usuario sin permisos no puede crear un producto', async () => {
            const productData = {
                "title": "Nuevo Producto",
                "description": "Descripción del nuevo producto",
                "code": "# Nuevo Producto",
                "price": 1000,
                "status": true,
                "category": "Electrónica",
                "thumbnail": ["imagen1", "imagen2"],
                "stock": 50
            };
        
            const { statusCode, body } = await requester
                .post('api/products/')
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(productData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
        
        it('5. PUT api/products/:pid Usuario sin permisos no puede actualizar un producto', async () => {
            const updateData = {
                "title": "Producto Actualizado",
                "description": "Descripción actualizada",
                "code": "# Producto Actualizado",
                "price": 1200,
                "status": true,
                "category": "Electrónica",
                "thumbnail": ["nueva-imagen1", "nueva-imagen2"],
                "stock": 60
            };
        
            const { statusCode, body } = await requester
                .put(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(updateData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
        
        it('6. PATCH api/products/:pid Usuario sin permisos no puede actualizar parcialmente un producto', async () => {
            const partialUpdateData = {
                "title": "Producto Modificado",
                "description": "Descripción modificada",
                "code": "# Producto Modificado",
                "price": 1100
            };
        
            const { statusCode, body } = await requester
                .patch(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`)
                .send(partialUpdateData);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });

        it('7. DELETE api/products/:pid Usuario sin permisos no puede eliminar un producto', async () => {
            const { statusCode, body } = await requester
                .delete(`api/products/${pid}`)
                .set('Cookie', `${cookie.name}=${cookie.value}`);
        
            expect(statusCode).to.be.eql(403);
            expect(typeof body, "object").to.be.ok;
            expect(body.statusMessage.toLowerCase()).to.be.eql('forbidden error');
            expect(body.data).to.be.eql('Credenciales inválidas');
        });
    });

});

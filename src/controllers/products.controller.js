import ProductsService from "../services/products.service.js";
import productsModel from "../dao/models/products.model.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"


class ProductsController {
    constructor(){
        this.productService = new ProductsService();
        this.productModel = productsModel;
        this.httpResponse = new HttpResponse();
    }

    getIdProducts = async (req, res) => {
        try {
            const product = await this.productService.getIdProducts(req);
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {product});    
        } catch (error) {
        const errorCode = EnumErrors.INVALID_PARAMS;
        req.logger[ErrorLevels[errorCode] || "error"](
        `${errorCode} - No se pudo obtener product en la base de datos: ${error}`,
        {
            errorCode,
            errorStack: error.stack,
        }
        ); 
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.INVALID_PARAMS} -  No se pudo obtener product en la base de datos `, 
            { error: `${error}` }
            );  
        }
    }

    getCombProducts = async (req, res) => {
        try {
            const productsPagination = await this.productService.getCombProducts(req);
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {productsPagination});    
        } catch (error) {
            const errorCode = EnumErrors.INVALID_PARAMS;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - No se pudo obtener los products en la base de datos: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );             
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.INVALID_PARAMS} -  No se pudo obtener los products en la base de datos `, 
                { error: `${error}` }
                );  
            }
    }

    addToProduct = async (req, res) => {
        try {
        const crearProducto = req.body;
        if (!crearProducto.title || !crearProducto.description || !crearProducto.code || !crearProducto.price || !crearProducto.status || !crearProducto.category || !crearProducto.stock) {
        const errorCode = EnumErrors.INCOMPLETE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - Campos incompletos en el producto: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );
        return this.httpResponse.BadRequest(
            res,
            `${EnumErrors.INCOMPLETE_ERROR}`, 
            { error }
            );
        } else {
        const addProduct = await this.productService.addToProduct(req);
        return this.httpResponse.Create(res, `${EnumSuccess.SUCCESS}`, {payload: addProduct});        
        }
        } catch (error){
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al procesar la petición POST: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al procesar la petición POST `, 
            { error: `${error}` }
            ); 
        }
    }

    updateProductsComplet = async (req,res) => {
        try {
            const users = req.user;
            if (users.role === "PREMIUM") {
                const products = await this.productService.getIdProducts(req);
                if (products.length > 0) {
                const product = products[0];
                const ownerId = product.owner.toString();
                if (ownerId  !== users.id) {
                    return this.httpResponse.Forbbiden(
                    res,
                    `${EnumErrors.FORBIDDEN_ERROR} - No tienes permiso para modificar este producto`
                    );
                }
                }
            }
            const actualizarProducto = req.body;
            if (!actualizarProducto.title || !actualizarProducto.description || !actualizarProducto.code || !actualizarProducto.price || !actualizarProducto.status || !actualizarProducto.category || !actualizarProducto.stock) {
                const errorCode = EnumErrors.INCOMPLETE_ERROR;
                req.logger[ErrorLevels[errorCode] || "error"](
                    `${errorCode} - Campos incompletos en la actualización del producto: ${error}`,
                    {
                    errorCode,
                    errorStack: error.stack,
                    }
                );
                return this.httpResponse.BadRequest(
                res,
                `${EnumErrors.INCOMPLETE_ERROR}`, 
                { error }
            );
        };
            const updateProductComp = await this.productService.updateProductsComplet(req);
            return this.httpResponse.Create(res, `${EnumSuccess.SUCCESS}`, {payload: updateProductComp});        
        } catch (error){
            const errorCode = EnumErrors.DATABASE_ERROR;
                req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - Error al procesar la petición PUT: ${error}`,
                {
                    errorCode,
                    errorStack: error.stack,
                }
                );
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.DATABASE_ERROR} -  Error al procesar la petición PUT `, 
                { error: `${error}` }
                ); 
            }
        }

    updateProductsPatch = async (req,res) => {
        try {
            const users = req.user;
            if (users.role === "PREMIUM") {
                const products = await this.productService.getIdProducts(req);
                if (products.length > 0) {
                const product = products[0];
                const ownerId = product.owner.toString();
                if (ownerId  !== users.id) {
                    return this.httpResponse.Forbbiden(
                    res,
                    `${EnumErrors.FORBIDDEN_ERROR} - No tienes permiso para modificar este producto`
                    );
                }
                }
            }
        const newObjUpdate = await this.productService.updateProductsPatch(req)
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {payload: newObjUpdate});        
        } catch (error){
            const errorCode = EnumErrors.DATABASE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - Error al procesar la petición PATCH: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );            
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.DATABASE_ERROR} -  Error al procesar la petición PATCH `, 
                { error: `${error}` }
                ); 
        }
    }

    
    deleteProduct =  async(req, res) => {
        try {
            const users = req.user;
            if (users.role === "PREMIUM") {
                const products = await this.productService.getIdProducts(req);
                if (products.length > 0) {
                const product = products[0];
                const ownerId = product.owner.toString();
                if (ownerId  !== users.id) {
                    return this.httpResponse.Forbbiden(
                    res,
                    `${EnumErrors.FORBIDDEN_ERROR} - No tienes permiso para eliminar este producto`
                    );
                }
                }
            }
            await this.productService.deleteProduct(req);
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, `DELETE realizado exitosamente`);        
        } catch (error) {
            const errorCode = EnumErrors.DATABASE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - Error al procesar la petición DELETE: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );            
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.DATABASE_ERROR} -  Error al procesar la petición DELETE `, 
                { error: `${error}` }
            ); 
        }
    }



}

export default ProductsController;
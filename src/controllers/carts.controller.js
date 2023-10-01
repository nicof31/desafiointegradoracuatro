import CartService from "../services/carts.service.js";
import ProductsService from "../services/products.service.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"


class CartsController {
    constructor(){
        this.cartService = new CartService();
        this.httpResponse = new HttpResponse();
        this.productService = new ProductsService();
    }

    getIdCarts = async (req, res) => {
      try {
          const cart = await this.cartService.getIdCarts(req);
          return res.render("carts/carts", { cart });
      } catch (error) {
          const errorCode = EnumErrors.CONTROLLER_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](
              `${errorCode} - No se pudo obtener cart en la base de datos ${error}`,
              {
                  errorCode,
                  errorStack: error.stack,
              }
          );
          return this.httpResponse.NotFound(
              res,
              `${EnumErrors.INVALID_PARAMS} -  No se pudo obtener cart en la base de datos `,
              { error: `${error}` }
          );
      }
  }
  
    getAllCarts = async (req, res) => {
        try {
            const carts = await this.cartService.getAllCarts(req); 
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {carts});        
        } catch (error) {
            const errorCode = EnumErrors.DATABASE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
              `${errorCode} - No se pudo obtener los carts en la base de datos`,
              {
                errorCode,
                errorStack: error.stack,
              }
            );            
            return this.httpResponse.NotFound(
              res,
              `${EnumErrors.DATABASE_ERROR} -  No se pudo obtener los carts en la base de datos `, 
            { error: `${error}` }
          );   
          }
    }
    
      addToCart = async (req, res) => {
        try {
          const users = req.user;
            console.log("🚀 ~ file: carts.controller.js:62 ~ CartsController ~ addToCart= ~ users:", users)
            if (users.role === "PREMIUM") {
                const products = await this.productService.getIdProducts(req);
                if (products.length > 0) {
                const product = products[0];
                const ownerId = product.owner.toString();
                if (ownerId === users.id) {
                  return this.httpResponse.Forbbiden(
                    res,
                    `${EnumErrors.FORBIDDEN_ERROR} - No puedes agregar tu propio producto al carrito`
                  );
                }
                }
            }
          const addCartQuan = await this.cartService.addToCart(req);
          return this.httpResponse.Create(res, `${EnumSuccess.SUCCESS}`, {payload: addCartQuan});    
        } catch (error) {
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
      };


    updateCarts = async (req, res) => {
        try {
          const updateCart = await this.cartService.updateCarts(req);   
          return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {payload: updateCart});    
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

    updateCartsComplet = async (req,res) => {
        try {
          const updateCartCompl = await this.cartService.updateCartsComplet(req); 
          return this.httpResponse.Create(res, `${EnumSuccess.SUCCESS}`, {payload: updateCartCompl});    
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

    deleteProductCarts = async (req,res) => {
      try {
        const deleteProductCart = await this.cartService.deleteProductCarts(req); 
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {payload: deleteProductCart});    
      } catch (error){
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

    deleteOneProdCarts = async (req,res) => {
      try {
        const deleteOneProdCart = await this.cartService.deleteOneProdCarts(req); 
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {payload: deleteOneProdCart });    
      } catch (error){
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

    purchaseCart = async (req, res) => {
      try {
        const cartId = req.params.cid;
        const result = await this.cartService.purchaseCart(req);
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {payload: result });    
      } catch (error) {
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
    };

}


export default CartsController;

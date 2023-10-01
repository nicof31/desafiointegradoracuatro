import { appConfig } from "../config/config.js";
const { JWT_COOKIE_NAME } = appConfig;
import UserModel from "../dao/models/users.model.js";
import productsModel from "../dao/models/products.model.js";
import ViewsService from "../services/views.service.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

class ViewsController {
    constructor(){
        this.userModel = UserModel;
        this.productsModel = productsModel; 
        this.viewService = new ViewsService();
        this.httpResponse = new HttpResponse();
    }

    getChatView = async (req,res) => { 
        try {
        const chat = "prueba chat web socket";
        return res.render('chat', { chat });
        } catch (error) {
            const errorCode = EnumErrors.INVALID_PARAMS;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} -  No se puede obtener la vista de chat: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );    
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.INVALID_PARAMS} -  No se puede obtener la vista de chat: `, 
            { error: `${error}` }
            );   
        }
    }

    getLoginView(req, res) {
        try {
        return res.render("user/login", {
            title: "Login",
            style: "home",
            logued: false,
        });
        } catch (error) {
        const errorCode = EnumErrors.BADREQUEST_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} -  Ocurrió un error al renderizar la página de login: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );  
        return res.render("user/loginerror", { error: `${EnumErrors.BADREQUEST_ERROR} - Ocurrió un error al renderizar la página de login` });
        }
    }
 
    getHomePageView(req, res) {
        try {
        return res.render("user/login", {
            title: "Login",
            style: "home",
            logued: false,
        });
        } catch (error) {
        const errorCode = EnumErrors.BADREQUEST_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - error al renderizar la página de inicio: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );        
        return res.render("user/loginerror", { error: `${EnumErrors.BADREQUEST_ERROR} - error al renderizar la página de inicio` });
        }
    }

    logout = async (req, res) => {
        try {
        res.clearCookie(JWT_COOKIE_NAME);
        res.redirect('/login');
        } catch (error) {
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Ocurrió un error al cerrar sesión: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );      
        return this.httpResponse.Error(
            res,
            `${EnumErrors.CONTROLLER_ERROR} - Ocurrió un error al cerrar sesión`,
        {error}
        );
        }
    }

    getProductsView = async (req, res) => {
        try {
        const productsPagination = await this.viewService.getProductsView(req);
        res.render('products', productsPagination);
        } catch (error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al realizar la búsqueda paginada: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );  
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al realizar la búsqueda paginada:  `, 
            { error: `${error}` }
            );  
        }
    }

    getProfileView = (req, res) => {
        try {
        const { first_name, last_name, email, role } = req.user.user;
        const user = {
            first_name,
            last_name,
            email,
            role
        };
        res.render("user/profile", { user });
        } catch(error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al obtener la vista de perfil: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );        
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al obtener la vista de perfil `, 
            { error: `${error}` }
            );  
        }
    }

    getRegisterView = async (req, res) => {
        try {
        res.render("user/register", {
            title: "Registro",
            style: "home",
            logued: false,
        });
        } catch(error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al obtener la vista de registro: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al obtener la vista de registro: `, 
            { error: `${error}` }
            );  
        }
    }

    getRecoverView = async (req, res) => {
        try {
        res.render("user/recover");
        } catch(error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al obtener la vista de recuperación de contraseña: ${error}`,
            {
            errorCode,
            errorStack: error.stack,
            }
        );
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al obtener la vista de recuperación de contraseña: `, 
            { error: `${error}` }
            );  
    }
    }

    getEmailRecover = async (req, res) => {
        try {
            res.render("user/emailRecover");
            } catch(error) {
            const errorCode = EnumErrors.DATABASE_ERROR;
            req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - Error al obtener la vista de recuperación de contraseña: ${error}`,
                {
                errorCode,
                errorStack: error.stack,
                }
            );
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.DATABASE_ERROR} -  Error al obtener la vista de recuperación de contraseña: `, 
                { error: `${error}` }
                );  
        }
    }
  






}



export default ViewsController;

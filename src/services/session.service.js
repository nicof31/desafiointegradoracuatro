import { SESSION_REPOSITORY } from "../repository/respositoryManager.js"
import validateSchema from "../middleware/validate-dto.middleware.js";
import { CURRENT_DTO } from "../dto/dtoManager.js";


class SessionService {
    constructor(){
        this.sessionRepository = SESSION_REPOSITORY
    }

    allToRegister= async (req) => {
        try {
            const newUser = await this.sessionRepository.allToRegister(req);        
            console.log("sessionService: Usuario con carrito registrado exitosamente:", newUser);
            return newUser;
        } catch (error) {
            console.log(`sessionService: no se pudo registrar usuario: '${error}'`)
            throw error;    
        }
    }

    recoverUser = async (req) => {
        try {
            const newPswHashed = await this.sessionRepository.recoverUser(req);
            return newPswHashed;            
        } catch (error) {
            console.log(`sessionService: no se pudo cambiar Password: '${error}'`)
            throw error;    
        }
    }

    loginUser = async (req) => {
            try {
            const signUser = await this.sessionRepository.loginUser(req);
            console.log("🚀 ~ file: session.service.js:37 ~ SessionService ~ loginUser= ~ signUser:", signUser)
            return signUser
            } catch (error) {
            console.error(`sessionService: Error al generar el token: ${error}`);
            throw error; 
            }
    }

    loginGitHub = async (req, res) => {
        try {       
        const token =  await this.sessionRepository.loginGitHub(req, res);
        return token;
        } catch (error) {
        console.error(`sessionService: Error al generar el token: ${error}`);
        throw error;
        }
    }

    githubCallback = async (req, res) => {
        try {       
        const token =  await this.sessionRepository.githubCallback(req, res);
        return token;
        } catch (error) {
        console.error(`sessionService: Error al generar el token: ${error}`);
        throw error;
        }
    }

    getCurrentUserInfo  = async (req) => {
        try {
        const userInfo = await this.sessionRepository.getCurrentUserInfo(req);
        //valido rta con DTO
        await validateSchema(userInfo, CURRENT_DTO);
        console.log("validacion currentDTO correcta");
        return userInfo;        
        } catch (error) {
        console.error(`sessionService: Error al procesar la solicitud: ${error}`);
        throw error;
        }
    }

    getTicketsByUser = async (userEmail) => {
        try {
        const tickets = await this.sessionRepository.getTicketsByUser(userEmail);
        return tickets;
        } catch (error) {
        throw error;
        }
    }

    getUser = async (req) => {
        try {
        const userEmail = await this.sessionRepository.getUser(req);
        return userEmail ;
        } catch (error) {
        throw error;
        }
    }

    changeRole = async (uid) => {
        try {
        const resultChange = await this.sessionRepository.changeRole(uid);
        return resultChange ;
        } catch (error) {
        throw error;
        }
    }

    getUserRole = async (uid) => {
        try {
        const resultFind = await this.sessionRepository.getUserRole(uid);
        return resultFind ;
        } catch (error) {
        throw error;
        }
    }

    uploadDocuments = async (req) => {
        try {
        const resultUpl= await this.sessionRepository.uploadDocuments(req);
        return resultUpl ;
        } catch (error) {
        throw error;
        }
    }
    
}


export default SessionService;
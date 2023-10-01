import UserModel from "../../models/users.model.js";
import { createHashValue, compareHashedValues } from "../../../utils/encrypt.js";
import CartsManagerMongo from "./cartsManager.mongodb.js";
import passport from "passport";
import { generateJWT } from "../../../utils/jwt.js";
import TicketManagerDB from "./ticketManager.mongodb.js";
import ticketModel from "../../models/ticket.model.js";
import { comparePassword } from "../../../utils/encrypt.js";
import EmailService from "../../../services/email.service.js";
import multer from 'multer';

export default class UserManagerMongo {

  constructor(){
    this.cartsManagerMongo = new CartsManagerMongo();
    this.ticketManager = new TicketManagerDB();
    this.ticketModel = ticketModel;
    this.emailService = new EmailService();
}


allToRegister = async (req) => {
  try {
      const { first_name, last_name, email, password, age, role } = req.body;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
      }
      const pswHashed = await createHashValue(password);
      const newUser = await UserModel.create({
          email,
          password: pswHashed,
          first_name,
          last_name,
          age,
          role,
          cart: null,
      });

      console.log("sessionManager: Usuario registrado exitosamente:", newUser);
      const idUser = newUser._id.toString();
      console.log("🚀 ~ file: session.router.js:46 ~ routerSession.post ~ idUser:", idUser);
      const newUserWithCart = await this.cartsManagerMongo.addCartsRegister(idUser);
      console.log("sessionManager: Usuario con carrito registrado exitosamente:", newUserWithCart);
      newUser.cart = newUserWithCart._id;
      await newUser.save();
      console.log("sessionManager: Usuario con carrito registrado exitosamente:", newUser);
      await this.emailService.sendWelcomeEmail(req.body.email);
      return newUser;
  } catch (error) {
      console.log(`sessionManager: no se pudo registrar usuario: '${error}'`);
      throw error;
  }
}

recoverUser = async (req) => {
  try {
    const { email, new_password } = req.body;
    const recoverResult = await this.getUser(email);
    if (recoverResult.error)  {
      return { error: true, message: `El usuario con el correo electrónico ${email} no existe` };
    }
    const newPasswordHashed = await createHashValue(new_password);
    const passwordsMatch = await comparePassword(recoverResult , new_password);
    if (passwordsMatch === true) {
      console.log("la contraseña  es == a la anterior")
      return { error: true, message: "La nueva contraseña debe ser diferente a la anterior" };
    }
    await UserModel.findByIdAndUpdate(recoverResult._id, {
      password: newPasswordHashed,
    });
    console.log(`userManager: Password cambiado correctamente`);
    await this.emailService.sendPasswordChangedEmail(email);  
    return { success: true, message: "Contraseña cambiada exitosamente" };
  } catch (error) {
    console.log(`userManager: no se pudo cambiar Password: ${error}`);
    throw { error: true, message: "Ocurrió un error al cambiar la contraseña" };
  }
};



  loginUser = async (req) => {
    return new Promise((resolve, reject) => {
    passport.authenticate("login", async (err, user, info) => {
        if (err) {
        console.error(`userManager: Error en la autenticación: ${err}`);
        reject({ error: "(401): sessionService Ocurrió un error en la autenticación" });
        }
        if (!user) {
        reject({ error: "(401): sessionManager: Credenciales inválidas" });
        }
        try {
        const signUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            id: user._id,
        };
        const token = await generateJWT({ ...signUser });
        console.log("🚀 ~ sessionService ~ token:", token);
        await this.setLastConnection(user._id);
        resolve (token);
        } catch (error) {
        console.error(`sessionManager: Error al generar el token: ${error}`);
        reject({ error: "sessionManager: Error en el servidor" });
        }
    })(req);
    });
}

loginGitHub = async (req, res) => {
  try {
    return new Promise((resolve, reject) => {
      passport.authenticate("github", { session: false }, (err, token) => {
        if (err) {
          console.error(`userManager: Error en la autenticación: ${err}`);
          return reject(err);
        }
        resolve(token);
      })(req, res); 
    });
  } catch (error) {
    console.error(`userManager: Error al generar el token: ${error}`);
    throw error;
  }
};

githubCallback = async (req, res) => {
  try {
    return new Promise((resolve, reject) => {
      passport.authenticate("github", { session: false }, (err, token) => {
        if (err) {
          console.error(`userManager: Error en la autenticación: ${err}`);
          return reject(err);
        }
        resolve(token);
      })(req, res);
    });
  } catch (error) {
    console.error(`userManager: Error al generar el token: ${error}`);
    throw error;
  }
};


getCurrentUserInfo = async (req) => {
  try {
    const { iat, exp } = req;
    console.log("🚀 ~ file: UserManager.mongodb.js:166 ~ UserManagerMongo ~ getCurrentUserInfo= ~ req.user:", req.user)
    const { first_name, last_name, email, role, cart, id } = req.user;
    const user = {
      first_name,
      last_name,
      email,
      role,
      cart,
      id,
      iat,
      exp,
    };

    return user;
  } catch (error) {
    console.error(`SessionManager: No se puede obtener la información del usuario actual: ${error}`);
    throw error;
  }
};


getUser =  async(email) => {
    try {
      let user = await UserModel.findOne({ email }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists`);
      return user;
    } catch (error) {
      return { error: error.message };
    }
}

getTicketsByUser = async (userEmail) => {
  try {
  const tickets = await ticketModel.find({ purchaser: userEmail });
  console.log("🚀 ~ file: UserManager.mongodb.js:327 ~ UserManagerMongo ~ getTicketsByUser= ~ userEmail:", userEmail)
  console.log("🚀 ~ file: UserManager.mongodb.js:327 ~ UserManagerMongo ~ getTicketsByUser= ~ tickets:", tickets)
  return tickets;
  } catch (error) {
  throw error;
  }
}

changeRole = async (uid) => {
  try {
    const user = await UserModel.findOne({ _id: uid }, { __v: 0 }).lean();
    if (!user) throw new Error(`User not exists.`);
    const requiredDocuments = ['documentIdentificacion', 'documentDomicilio', 'documentEstadodecuenta'];
    const missingDocuments = requiredDocuments.filter(doc => !user.documents.find(d => d.name === doc));
    if (missingDocuments.length > 0) {
      throw new Error(`Usuario incompleto: Falta cargar los documentos: ${missingDocuments.join(', ')}`);
    }
    let newRole = (user.role === "USER") ? "PREMIUM" : "USER";
    await UserModel.updateOne(
      { _id: uid },
      { $set: { role: newRole }}
    );
    const updatedUser = await UserModel.findOne({ _id: uid }, { __v: 0, password: 0 }).lean();
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

getUserRole = async (uid) => {
  try {
    const user = await UserModel.findOne({ _id: uid }, { __v: 0, password: 0 }).lean();
    if (!user) throw new Error(`User not exists.`);
    return user;
  } catch (error) {
  throw error;
  }
}

setLastConnection = async (uid) => {
  try {
    let result = await UserModel.updateOne(
      { _id: uid },
      { $set: { last_connection: new Date().toISOString() } }
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

uploadDocuments = async (req, res) => {
  try {
    const { uid } = req.params;
    const { files } = req;
    const userEmail = req.user.user.email;  
    let user = await this.getUser(userEmail);
    if (!user || !user.documents) {
      throw new Error(`Usuario no encontrado o sin documentos.`);
    }
    let documents = [];
    files.forEach((file) => {
      documents.push({ name: file.fieldname, reference: file.filename });
    });
    const updatedDocuments = await this.pushDocument(user._id, documents);
    return updatedDocuments ;
  } catch (error) {
    return(error);
  }
};

pushDocument = async (uid, documents) => {
  try {
    let user = await UserModel.findOne({ _id: uid }, { __v: 0 }).lean();
    if (!user) throw new Error(`User not exists.`);
    let documentFind = user.documents || [];
    documents.forEach((document) => {
      const existingIndex = documentFind.findIndex((doc) => doc.name === document.name);
      if (existingIndex !== -1) {
        documentFind[existingIndex].reference = document.reference;
      } else {
        documentFind.push(document);
      }
    });
    let result = await UserModel.updateOne(
      { _id: uid },
      { $set: { documents: documentFind } }
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
}


}

import Jwt from "jsonwebtoken";
import passport from "passport";
import { appConfig } from "../config/config.js";

const { SECRET_JWT, JWT_COOKIE_NAME } = appConfig;

const generateJWT = (user) => {
    return new Promise((resolve, reject) => {
      //{ expiresIn: "1h" }
      Jwt.sign({ user }, SECRET_JWT, { expiresIn: "45m" }, (err, token) => {
        if (err) {
          console.log("🚀 ~ file: jwt.js:10 ~ jwt.sign ~ err:", err);
          reject("can not generate token, something wrong");
        }
        resolve(token);
      });
    });
  };
  

  const extractCookie = req => {
    return (req && req.cookies) ? req.cookies[JWT_COOKIE_NAME] : null
}

const passportCall = (strategy) => {
    return async (req, res, next) => {
      passport.authenticate(strategy, function (err, user, info) {
        if (err) return next(err);
  
        if (!user) {
          //return res.status(401).json({error: info.messages ? info.messages : info.toString(), message: `error in jwt`,});
          return res.render('user/timeExpToken', {err})
        }
        req.user = user;
        next();
      })(req, res, next);
    };
  };

const generateRecoveryToken = (email) => {
    try {
        const recoveryToken = Jwt.sign({ email }, SECRET_JWT, { expiresIn: "1h" });
        return recoveryToken;
    } catch (error) {
        console.error(`Error al generar el token de recuperación: ${error}`);
        throw error;
    }
  };

const validateRecoveryToken = (req, res, next) => {
    const recoveryToken = req.query.token;
    Jwt.verify(recoveryToken, SECRET_JWT, (err, decoded) => {
      if (err) {
        console.error(`Error al validar el token de recuperación: ${err}`);
        return res.render('user/timeExpTokenRecover', {err})
      }
      req.email = decoded.email;
      next();
    });
  };
  
  

  export { generateJWT, extractCookie, passportCall, generateRecoveryToken, validateRecoveryToken };

  
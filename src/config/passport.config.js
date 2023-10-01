import dotenv from "dotenv"
import passport from "passport";
import LocalStrategy from "passport-local";
import GithubStrategy from "passport-github2";
import UserModel from "../dao/models/users.model.js";
import { isValidPasswd } from "../utils/encrypt.js";
import { appConfig } from "../config/config.js"
import { generateJWT, extractCookie } from "../utils/jwt.js";
import ROLES from "../constantes/role.js";
import jwt from "passport-jwt";
import cartsModel from "../dao/models/carts.model.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import CartsManagerFs from "../dao/managers/fileSystem/cartsManager.fs.js";
import UserManagerMongo from "../dao/managers/mongodb/UserManager.mongodb.js";
import UserManagerFS from "../dao/managers/fileSystem/userManager.fs.js";


const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SECRET_JWT} = appConfig

//const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SECRET_JWT } = appConfig;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const userPath = path.join("src/files/users.json");
const cartManagerFs = new CartsManagerFs();
const userManagerMongo = new UserManagerMongo();
const userManagerFs = new UserManagerFS();

const initializePassport = () => {
  //LOGIN POR LOCAL VALIDACION POR TOKEN - GUARDO TOKEN EN LA COOKIE
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([extractCookie]),
        secretOrKey: SECRET_JWT,
      },
      async (jwtPayload, done) => {
        console.log(
          "🚀 ~ file: passport.config.js:20 ~ jwtPayload:",
          jwtPayload
        );
        try {
          if (ROLES.includes(jwtPayload.role)) {
            return done(null, jwtPayload);
          }
          return done(null, jwtPayload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // LOGIN POR LOCAL
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Credenciales inválidas" });
          }
          // Verifico la contraseña
          const isValidComparePsw = await isValidPasswd(
            password,
            user.password
          );
          if (!isValidComparePsw) {
            return done(null, false, { message: "Credenciales inválidas" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // GITHUB
passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/session/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.email;
        let user = await UserModel.findOne({ email });
        if (!user) {
          const newUser = await UserModel.create({
            email,
            first_name: profile.displayName,
            last_name: "GITHUB",
            age: 19,
            role: "USER",
            cart: null,
          });

          console.log("Usuario registrado exitosamente:", newUser);
          const idUser = newUser._id.toString() 
          console.log("🚀 ~ file: session.router.js:46 ~ routerSession.post ~ idUser:", idUser)

          const newUserWithCart = await cartsModel.create({
            products: [],
            user: idUser,
          });
          newUser.cart = newUserWithCart;
          await newUser.save();
          console.log(
            "Usuario con carrito registrado exitosamente:",
            newUser
          );
          user = newUser;
        }

        const signUser = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          //cart: user.cart,
          id: user._id,
        };
        const token = await generateJWT({ ...signUser });
        console.log("🚀 ~ file: passport.config.js:129 ~ token:", token);
        await userManagerMongo.setLastConnection(user._id);

        done(null, token);
      } catch (error) {
        done(error);
      }
    }
  )
);

// LOGIN POR LOCAL (Filesystem)
passport.use(
  "loginFs",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const users = await loadUsers(); // Cargar datos de usuarios desde el archivo
        const user = users.find((u) => u.email === email);
        console.log("🚀 ~ file: passport.config.js:146 ~  user:",  user)
        if (!user) {
          return done(null, false, { message: "Credenciales inválidas" });
        }
        // Verifico la contraseña
        const isValidComparePsw = await isValidPasswd(password, user.password);
        if (!isValidComparePsw) {
          return done(null, false, { message: "Credenciales inválidas" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);


passport.use(
  "githubfs",
  new GithubStrategy (
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/session/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.email;
        // Lee los datos de usuarios en FileSystem
        const data = await fs.promises.readFile(userPath, 'utf-8');
        const users = JSON.parse(data);
        let user = users.find(u => u.email === email);
        if (!user) {
          // Crea un nuevo usuario en FileSystem si no existe
          const newUser = {
            _id: uuidv4(), // Genera un ID único con uuid v4
            email,
            first_name: profile.displayName,
            last_name: "GITHUB",
            age: 19,
            role: "USER",
            cart: null,
          };
          users.push(newUser);
          // Generar un carrito y asignar el _id al usuario
          const newUserWithCart = await cartManagerFs.addCartsRegister(newUser._id);
          newUser.cart = newUserWithCart._id;
          await fs.promises.writeFile(userPath, JSON.stringify(users, null, 2), 'utf-8');
          console.log("Usuario registrado exitosamente:", newUser);
          const cartsData = await fs.promises.readFile(cartsPath, 'utf-8');
          const carts = JSON.parse(cartsData);
          carts.push(newUserWithCart);

          await fs.promises.writeFile(cartsPath, JSON.stringify(carts, null, 2), 'utf-8');

          newUser.cart = newUserWithCart;

          console.log("Usuario con carrito registrado exitosamente:", newUser);

          user = newUser;
        }
        const signUser = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          id: user._id,
        };

        const token = await generateJWT({ ...signUser });
        await userManagerFs.setLastConnectionFS(user._id);
        
        done(null, token);
      } catch (error) {
        done(error);
      }
    }
  )
);



  passport.serializeUser((user, done) => {
    console.log(user._id);
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let userFind = await UserModel.findById(id);
      // Creo 'user' con el campo del password ''
      let user = { ...userFind.toObject(), password: "" };
      //console.log("🚀 ~ file: passport.config.js:161 ~ passport.deserializeUser ~  user:",  user)
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  async function loadUsers() {
    try {
      const data = await fs.promises.readFile("src/files/users.json", "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe, se devuelve un array vacío
      return [];
    }
  }


};

export default initializePassport;

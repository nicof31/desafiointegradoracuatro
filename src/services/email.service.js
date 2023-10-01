import nodemailer from "nodemailer";
import { appConfig } from "../config/config.js";
import { generateRecoveryToken } from "../utils/jwt.js";
const { EMAIL, PSW_EMAIL} = appConfig;


class EmailService { 
    constructor(){
      this.generateRecoveryToken = generateRecoveryToken
    }


    sendEmail = async (req) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                user: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                user: EMAIL,
                pass: PSW_EMAIL,
                },
            });
            let result = await transporter.sendMail({
                from: EMAIL,
                to: req.body.email,
                subject: `Ecommerce Backend: Novedades`,
                html: `
                  <html>
                    <head>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 0;
                        }
                        .container {
                          max-width: 600px;
                          margin: 0 auto;
                          padding: 20px;
                          background-color: #f8f9fa;
                          border-radius: 5px;
                          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                          color: #007bff;
                        }
                        p {
                          font-size: 16px;
                        }
                        img {
                          max-width: 100%;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1>SUPER DESCUENTOS</h1>
                        <p>Aprovecha el 15% de descuento en todos nuestros productos</p>
                        <img src="cid:logo" alt="Company Logo" />
                      </div>
                    </body>
                  </html>
                `,
                attachments: [
                    {
                        filename: "addcarts.webp",
                        path: `${process.cwd()}` + `/src/public/img/addcarts.webp`,
                        cid: "loro",
                      },
                      {
                        filename: "BienvenidoEcommerceOnline.pdf",
                        path: `${process.cwd()}` + `/src/public/email/BienvenidoEcommerceOnline.pdf`,
                      },
                      {
                        filename: "experienciaecommerce.webp",
                        path: `${process.cwd()}` + `/src/public/img/experienciaecommerce.webp`,
                      },
                ],
              });
              console.log(
                "🚀 ~ file: email.routes.js:32 ~ router.post ~ result:",
                result
              );

          return result;
        } catch (error) {
          console.error(`emailService: Error al procesar la petición POST: ${error}`);
          throw error;;
        }
      };


      sendWelcomeEmail = async (userEmail) => {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: EMAIL,
              pass: PSW_EMAIL,
            },
          });
    
          let result = await transporter.sendMail({
            from: EMAIL,
            to: userEmail,
            subject: `¡Bienvenido a nuestro sitio web!`,
            html: `
              <html>
                <head>
                  <style>
                    /* Estilos CSS para el correo de bienvenida */
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>¡Bienvenido a nuestro sitio web!</h1>
                    <p>Gracias por registrarte en nuestro sitio. Esperamos que disfrutes de nuestras ofertas y productos.</p>
                    <img src="cid:logo" alt="Company Logo" />
                  </div>
                </body>
              </html>
            `,
            attachments: [
              {
                  filename: "addcarts.webp",
                  path: `${process.cwd()}` + `/src/public/img/addcarts.webp`,
                  cid: "loro",
                },
                {
                  filename: "BienvenidoEcommerceOnline.pdf",
                  path: `${process.cwd()}` + `/src/public/email/BienvenidoEcommerceOnline.pdf`,
                },
                {
                  filename: "experienciaecommerce.webp",
                  path: `${process.cwd()}` + `/src/public/img/experienciaecommerce.webp`,
                },
          ],
          });
    
          console.log("Correo de bienvenida enviado:", result);
    
          return result;
        } catch (error) {
          console.error(`Error al enviar el correo de bienvenida: ${error}`);
          throw error;
        }
      };

      sendPasswordChangedEmail = async (userEmail) => {
        try {
          const transporter = await nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: EMAIL,
              pass: PSW_EMAIL,
            },
          });

          let result =  await transporter.sendMail({
            from: EMAIL,
            to: userEmail,
            subject: `Contraseña Cambiada`,
            html: `
              <html>
                <head>
                  <style>
                    /* Estilos CSS para el correo de confirmación de cambio de contraseña */
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Contraseña Cambiada</h1>
                    <p>Te informamos que la contraseña de tu cuenta ha sido cambiada recientemente. Si no realizaste esta acción, por favor contacta con nuestro equipo de soporte.</p>
                    <p>Si fuiste tú quien realizó el cambio, no necesitas tomar ninguna acción adicional.</p>
                  </div>
                </body>
              </html>
            `,
          });
    
          console.log("Correo de confirmación de cambio de contraseña enviado:", result);
          return result;
        } catch (error) {
          console.error(`Error al enviar el correo de confirmación de cambio de contraseña: ${error}`);
          throw error;
        }
      };

    sendPasswordRecoveryEmail = async (req, res) => {
        try {
          const { email } = req.body;
          const recoveryToken = this.generateRecoveryToken(email);
          console.log("🚀 ~ file: email.service.js:203 ~ EmailService ~ sendPasswordRecoveryEmail= ~ recoveryToken:", recoveryToken)
      
          const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: EMAIL,
              pass: PSW_EMAIL,
            },
          });
      
          const recoveryLink = `http://localhost:8080/recover?token=${recoveryToken}`;
      
          const result = await transporter.sendMail({
            from: EMAIL,
            to: email,
            subject: "Recuperación de Contraseña",
            html: `
              <html>
                <head>
                  <style>
                    /* Estilos CSS para el correo de recuperación de contraseña */
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Recuperación de Contraseña</h1>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <a href="${recoveryLink}">Restablecer Contraseña</a>
                    <p>Este enlace expirará en 1 hora.</p>
                  </div>
                </body>
              </html>
            `,
          });
      
          console.log("Correo de recuperación de contraseña enviado:", result);
        } catch (error) {
          console.error(`Error al enviar el correo de recuperación de contraseña: ${error}`);
          throw error;
        }
      };

}


export default EmailService;

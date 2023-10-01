export const swaggerOpts = {
    definition: {
        openapi: '3.0.1', 
        info: {
            title: "Backend Ecommerce",
            description: "E-Commerce de productos,\n\nPara realizar la prueba de las rutas, abre otra pestaña del navegador y inicia sesión para generar el token correspondiente a la sesión. En caso de usar el usuario de prueba, utiliza las siguientes credenciales:\n\nUsuario 'ADMIN': \nU: adminCoder@coder.com\nC: adminCod3r123\nId Cart Asignado: 64daba2cc434655ddc22c80c\n\nUsuario 'USER':\nU: userCoder@coder.com\nC: userCod3r123\nId Cart Asignado: 64dab5f1c45a31639586fbcc\n\nUsuario 'PUBLIC':\nU: publicCoder@coder.com\nC: publicCod3r123\nId Cart Asignado: 64db617c3ca5daa43d931a79\n\nUsuario 'PREMIUM':\nU: coderPremium@gmail.com\nC: 123456\nId Cart Asignado: 64f3960667b0646988d42f9b\n\n[Recover password: Requiere crear un usuario con un email real para probar la función de recuperación de contraseña, ya que la aplicación enviará un email con un enlace y token para restablecer la clave.]",
            version: '1.0.5',
            contact: {
                email: 'backendecommerce3@gmail.com'
            },
        },
        externalDocs: {
            description: "Enlace de inicio de sesión",
            url: "http://localhost:8080/login"
        }
    },
    apis: [`./src/docs/**/*.yaml`]
};

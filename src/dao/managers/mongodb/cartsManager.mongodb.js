import cartsModel from "../../models/carts.model.js";
import productsModel from "../../models/products.model.js";
import UserModel from "../../models/users.model.js";
import TicketManagerDB from "./ticketManager.mongodb.js";

export default class CartsManagerMongo {
  constructor(path) {
    this.path = path;
    this.ticketManager = new TicketManagerDB();
  }

  //--------------------GET CARTS---------------------
  getIdCarts = async (cartId) => {
    try {
      const cart = await cartsModel
        .findById(cartId)
        .populate("products.product")
        .lean();
      console.log("🚀 ~ file: cartsManager.mongodb.js:19 ~ CartsManagerMongo ~ getIdCarts= ~ cart :", cart )
      if (!cart) {
        throw new Error(
          "CartManager: El id de carrito  buscado no existe, cargue un nuevo id"
        );
      }
      cart.products.forEach((product) => {
        product.totalPrice = product.quantity * product.price;
      });      
      return cart;
    } catch (error) {
      console.log(`CartManager: no se pudo procesar la solicitud: ${error}`);
      throw error;
    }
  };

  getAllCarts = async (req) => {
    try {
      let cartsFilter = await cartsModel.find();
      if (req.query.limit) {
        cartsFilter = await cartsModel.find().limit(req.query.limit);
      }
      return cartsFilter;
    } catch (error) {
      console.log(`CartManager: no se pudo obtener carts: ${error}`);
      throw error;
    }
  };

  //--------------------MANEJO DEL CARRITO ADD CARTS---------------------
    //SE USA EN SESION SERVICE
  addCartsRegister = async (userId) => {
    try {
      console.log("estoy saliendo por aca");
      const newCart = await cartsModel.create({
        user: userId,
        products: [],
      });
      return newCart;
    } catch (error) {
      console.error("Error en el registro de usuario:", error);
      throw error;
    }
  };

  addToCart = async (req) => {
    try {
      const idProductAddCart = req.params.pid.toString();
      const userEmail = req.user.email;
      const userId = req.user.id;
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      const idCart = user.cart;
      if (!idCart) {
        throw new Error("Carrito no encontrado para este usuario");
      }
      const idCartDs = idCart.toString();
      const accion = req.query.accion;
      if (accion === "aumentar") {
        await this.addCartsPg(idCartDs, idProductAddCart, userId);
      } else if (accion === "disminuir") {
        await this.discountQuantityPro(idCartDs, idProductAddCart);
      } else {
        throw new Error("Acción no válida");
      }
      return { status: "success", message: `Cantidad ${accion} en el carrito` };
    } catch (error) {
      console.error(
        `cartService: error al procesar la petición POST: ${error}`
      );
      throw error;
    }
  };

  //--------------------ADD CANTINDAD------------------
  addCartsPg = async (idCart, idProductAddCart, userId) => {
    try {
      const idUser = userId;
      console.log(
        "🚀 ~ file: cartsmanager.mongodb.js:123 ~ cartsManagerMongo ~ addCartsPg= ~ idUser:",
        idUser
      );
      const cart = await cartsModel.findById(idCart);
      if (!cart) {
        const newCart = new cartsModel({
          _id: idCart,
          user: idUser,
          products: [{ product: idProductAddCart, quantity: 1 }],
        });
        await newCart.save();
        console.log("Creación del carrito y producto exitosa");
      } else {
        const product = await productsModel.findById(idProductAddCart);
        if (!product) {
          console.log("El producto no existe en la base de datos.");
          return;
        }
        const quantityToAdd = product.stock > 0 ? 1 : 0;
        const productExists = await cartsModel.findOne({
          _id: idCart,
          "products.product": idProductAddCart,
        });
        if (productExists) {
          console.log(
            "El producto ya existe en el carrito. Aumentando cantidad."
          );
          const existingProduct = cart.products.find(
            (product) =>
              product.product.toString() === idProductAddCart.toString()
          );
          const newQuantity = existingProduct.quantity + quantityToAdd;
          if (newQuantity > product.stock) {
            console.log(
              "La cantidad en el carrito supera el stock disponible."
            );
            return;
          }
          existingProduct.quantity = newQuantity;
        } else {
          console.log(
            "El producto no existe en el carrito. Agregando producto."
          );
          const newProduct = {
            product: idProductAddCart,
            quantity: quantityToAdd,
            stock: product.stock,
            price: product.price,
            totalPrice: quantityToAdd * product.price,
          };
          cart.products.push(newProduct);
        }
        await cart.save();
        console.log("Producto agregado al carrito con éxito");
      }
    } catch (error) {
      console.log(`Error en la función addCartsPg: ${error.message}`);
      throw error;
    }
  };

  //--------------------DISCONUNT CANTINDAD-------------------
  discountQuantityPro = async (idCartQuan, idProductsCartQuan, quanRta) => {
    try {
      let idQuanDes = idCartQuan;
      let idProducQuan = idProductsCartQuan;
      let quanSearch = Number(quanRta);
      const quanVerif = 0;
      cartsModel
        .findById(idQuanDes)
        .then((cart) => {
          if (!cart) {
            console.log("El carrito no existe.");
            return;
          }
          const existingProduct = cart.products.find(
            (product) => product.product.toString() === idProducQuan.toString()
          );
          if (!existingProduct) {
            console.log("El producto no existe en el carrito.");
            return;
          }
          if (existingProduct.quantity > quanVerif) {
            console.log("Disminuyendo la cantidad del producto en el carrito.");
            existingProduct.quantity--;
            cart
              .save()
              .then(() => {
                console.log(
                  "Se disminuyó la cantidad del producto en el carrito con éxito."
                );
              })
              .catch((error) => {
                console.error(`Error al guardar el carrito: ${error}`);
              });
          } else {
            console.log(
              "La cantidad de producto en el carrito es 0, no se puede descontar más cantidad."
            );
          }
        })
        .catch((error) => {
          console.log(`Error al buscar el carrito: ${error}`);
        });
    } catch (error) {
      console.log(`No se puede procesar la búsqueda: ${error}`);
      throw error;
    }
  };

  //-------------------UPDATE CANTIDAD-------------------
  updateCarts = async (req) => {
    try {
      const idCartUpd = req.params.cid;
      const idProdUpd = req.params.pid;
      const updateQuanityPut = req.body;
      const cart = await cartsModel.findById(idCartUpd);
      if (!cart) {
        throw new Error(
          `cartManager: El carrito _id: ${idCartUpd} buscado no existe, cargue un nuevo id`
        );
      }
      const existingProduct = cart.products.find(
        ({ product }) => product == idProdUpd
      );
      if (!existingProduct) {
        throw new Error(
          `cartManager: El producto _id:'${idProdUpd}' buscado no existe en cart _id:'${idCartUpd}', cargue un nuevo id de producto`
        );
      }
      const newQuantityUp = Number(updateQuanityPut.quantity);
      if (newQuantityUp <= 0) {
        throw new Error(`cartManager: La cantidad debe ser mayor que 0`);
      }
      existingProduct.quantity = newQuantityUp;
      await cart.save();
      return cart;
    } catch (error) {
      console.log(
        `cartManager: No se puede procesar la petición PUT '${error}'`
      );
      throw error;
    }
  };

  //-------------------UPDATE COMPLETO-------------------
  updateCartsComplet = async (req) => {
    try {
      const idCartUpd = req.params.cid;
      const updateProductPut = req.body;
      const cart = await cartsModel.findById(idCartUpd);
      if (!cart) {
        throw new Error(
          `cartManager: El  carrito _id: ${idCartUpd} buscado no existe, cargue un nuevo id`
        );
      }
      console.log(idCartUpd);
      const newObjProduct = updateProductPut;
      console.log(newObjProduct);

      const result = await cartsModel.findOneAndUpdate(
        { _id: idCartUpd },
        { $set: { products: newObjProduct } },
        { new: true }
      );
      if (result) {
        console.log(
          `cartManager: Se modificó products de carts con éxito: ${result.products}`
        );
      } else {
        console.log(
          `cartManager: No se encontró un carrito con el ID: ${idCartUpd}`
        );
      }
      return result;
    } catch (error) {
      console.log(
        `cartManager: No se puede procesar la petición PUT '${error}'`
      );
      throw error;
    }
  };
//--------------------DELETE PRODUCTOS COMPLETO DEL CARTS------------------
  deleteProductCarts = async (req) => {
    try {
      const idCartDelete = req.params.cid;
      console.log(
        "🚀 ~ file: carts.js:185 ~ routerCarts.delete ~ idCartDelete:",
        idCartDelete
      );
      const cart = await cartsModel.findById(idCartDelete);
      if (!cart) {
        throw new Error(
          `El carrito _id: ${idCartDelete} buscado no existe, cargue un nuevo id`
        );
      }
      cart.products = [];
      await cart.save();
      return cart;
    } catch (error) {
      console.log(
        `cartService: No se puede procesar la petición Delete '${error}'`
      );
      throw error;
    }
  };

  
  //--------------------DELETE PRODUCT DEL CARRITO------------------
  deleteOneProdCarts = async (req) => {
    try {
      const idCartDelete = req.params.cid;
      const idProductsCartDelete = req.params.pid;
      const cartSearchDelete = await cartsModel.find();
      const searchIdCartDelete = cartSearchDelete.find(
        ({ _id }) => _id == idCartDelete
      );
      if (!searchIdCartDelete) {
        throw new Error(
          `cartService: El carrito _id: ${idCartDelete} buscado no existe, cargue un nuevo id`
        );
      }
      const deleteProductCart = searchIdCartDelete.products;
      const deleteFilteredProduct = deleteProductCart.find(
        ({ product }) => product == idProductsCartDelete
      );
      if (!deleteFilteredProduct) {
        console.log(`cartService: El producto buscado no existe en el carrito`);
        throw new Error(
          `El producto _id:'${idProductsCartDelete}' buscado no existe, cargue un nuevo id`
        );
      }
      const productIndexDelete = searchIdCartDelete.products.findIndex(
        (product) => product._id == deleteFilteredProduct._id
      );
      if (productIndexDelete === -1) {
        console.log(`No se encontró el índice del producto`);
        return;
      }
      searchIdCartDelete.products.splice(productIndexDelete, 1);
      await searchIdCartDelete.save();
      console.log(
        `El producto _id: ${idProductsCartDelete} en el carrito _id: ${idCartDelete} se eliminó correctamente`
      );
      return searchIdCartDelete;
    } catch (error) {
      console.log(
        `cartService: No se puede procesar la petición Delete '${error}'`
      );
      throw error;
    }
  };

   //--------------------PURCHARSE------------------
  purchaseCart = async (req) => {
    try {
      const cartId = req.params.cid;
      console.log(
        "🚀 ~ file: cartsManager.mongodb.js:354 ~ CartsManagerMongo ~ processCartReq= ~ cartId:",
        cartId
      );
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        throw new Error("CartManager: Carrito no encontrado");
      }
      const user = await UserModel.findOne({ cart: cartId });
      if (!user) {
        throw new Error("CartManager: Usuario no encontrado");
      }
      const productsNotPurchased = []; 
      const productsPurchased = []; 
      let totalTicketAmount = 0; 
      let purchasedProducts = false;
      for (const cartItem of cart.products) {
        const product = await productsModel.findById(cartItem.product);
        if (!product) {
          throw new Error(`El producto con ID ${cartItem.product} no existe`);
        }
        if (product.stock > 0) {
          const purchaseQuantity = Math.min(cartItem.quantity, product.stock); 
          product.stock -= purchaseQuantity;
          await product.save();
          totalTicketAmount += purchaseQuantity * product.price;
          productsPurchased.push(cartItem.product); 
          purchasedProducts = true; 
        } else {
          productsNotPurchased.push({
            product: cartItem.product,
            quantity: cartItem.quantity,
            stock: product.stock,
            price: product.price,
            totalPrice: cartItem.quantity * product.price,
          }); 
          console.log(
            "🚀 ~ file: UserManager.mongodb.js:150 ~ UserManagerMongo ~ processCartReq= ~ productsNotPurchased:",
            productsNotPurchased
          );
        }
      }
      if (purchasedProducts) {
        const ticketData = {
          amount: totalTicketAmount,
          purchaser: user.email, 
        };
        const ticket = await this.ticketManager.addTicket(ticketData);
        cart.products = cart.products.filter(
          (cartItem) => !productsPurchased.includes(cartItem.product)
        );
        await cart.save();
        console.log("Carrito actualizado sin productos comprados:", cart);
        console.log("Productos no comprados:", productsNotPurchased);
        if (productsNotPurchased.length > 0) {
          return {
            message:
              "Algunos productos no pudieron ser procesados por falta de stock",
            productsNotPurchased,
          };
        } else {
          return {
            message: "Compra realizada exitosamente",
            productsNotPurchased,
          };
        }
      } else {
        console.log("No se compró ningún producto con stock suficiente.");
        return {
          message: "No se compró ningún producto con stock suficiente",
          productsNotPurchased,
        };
      }
    } catch (error) {
      console.error(`CartManager: Error al procesar la solicitud: ${error}`);
      throw error;
    }
  };

}

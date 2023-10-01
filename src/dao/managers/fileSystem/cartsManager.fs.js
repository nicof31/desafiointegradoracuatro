import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import ProductManagerFs from "./productManager.fs.js";
import TicketManagerFs from "./ticketManager.fs.js";

export default class CartsManagerFs {
  constructor() {
    this.path = "src/files/carts.json";
    this.userPath = "src/files/users.json";
    this.productsPath = "src/files/products.json";
    this.productManagerFs = new ProductManagerFs();
    this.ticketManagerFs = new TicketManagerFs();
  }

  //--------------------GET CARTS---------------------
  carts = async () => {
    if (fs.existsSync(this.path)) {
      const dataCart = await fs.promises.readFile(this.path, "utf-8");
      const cartRta = JSON.parse(dataCart);
      return cartRta;
    } else {
      return [];
    }
  };

  getIdCarts = async (idCarts) => {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(data);
      const cartIndex = carts.findIndex(({ _id }) => _id === idCarts);
      if (cartIndex === -1) {
        throw new Error(
          "CartManager: El id de carrito buscado no existe, cargue un nuevo id"
        );
      }
      const cart = carts[cartIndex];
      cart.products.forEach((product) => {
        product.totalPrice = product.quantity * product.price;
      });
      cart.totalCartPrice = await this.calculateTotalCartPrice(cart);
      carts[cartIndex] = cart;
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log(
        "🚀 ~ file: cartsManager.fs.js:52 ~ CartsManagerFs ~ getIdCarts= ~ cart:",
        cart
      );
      return cart;
    } catch (error) {
      console.log(`Error en la función getIdCarts: ${error.message}`);
      throw error;
    }
  };

  calculateTotalCartPrice = async (cart) => {
    return cart.products.reduce((total, product) => {
      if (product.quantity <= product.stock) {
        return total + product.totalPrice;
      }
      return total;
    }, 0);
  };

  getAllCarts = async (req) => {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      let carts = JSON.parse(data);
      if (req.query.limit) {
        carts = carts.slice(0, req.query.limit);
      }
      return carts;
    } catch (error) {
      console.log(`Error en la función getAllCarts: ${error.message}`);
      throw error;
    }
  };

  //--------------------ADD CARTS---------------------
  addCartsRegister = async (userId) => {
    try {
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);
      const newCart = {
        _id: uuidv4(),
        products: [],
        totalCartPrice: 0,
        user: userId,
      };
      carts.push(newCart);
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
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
      const userData = await fs.promises.readFile(this.userPath, "utf-8");
      const users = JSON.parse(userData);
      const user = users.find((u) => u.email === userEmail);
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
        const addPcart = await this.addCartsPg(
          idCartDs,
          idProductAddCart,
          userId
        );
      } else if (accion === "disminuir") {
        const disPcart = await this.discountQuantityPro(
          idCartDs,
          idProductAddCart
        );
        console.log(
          "🚀 ~ file: cartsManager.fs.js:127 ~ CartsManagerFs ~ addToCart= ~ disPcart:",
          disPcart
        );
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

  addCartsPg = async (idCart, idProductAddCart, userId) => {
    try {
      const idUser = userId;
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);
      const cartIndex = carts.findIndex((cart) => cart._id === idCart);
      if (cartIndex === -1) {
        const newCart = {
          _id: idCart,
          user: idUser,
          products: [],
        };
        carts.push(newCart);
      }
      const cart = carts[cartIndex];
      const productExists = cart.products.find(
        (producto) => producto.producto == idProductAddCart
      );
      if (productExists) {
        console.log(
          "El producto ya existe en el carrito. Aumentando cantidad."
        );
        productExists.quantity += 1;
      } else {
        console.log("El producto no existe en el carrito. Agregando producto.");
        const product = await this.productManagerFs.productById(
          idProductAddCart
        );
        if (!product) {
          console.log("El producto no existe en la base de datos.");
          return;
        }
        const quantityToAdd = product.stock > 0 ? 1 : 0; // Verifica si el producto tiene stock
        const newProduct = {
          producto: Number(idProductAddCart),
          quantity: quantityToAdd,
          stock: product.stock,
          price: product.price,
          totalPrice: quantityToAdd * product.price,
          title: product.title,
          description: product.description,
          code: product.code,
          _id: uuidv4(),
        };
        cart.products.push(newProduct);
      }
      cart.totalCartPrice = await this.calculateTotalCartPrice(cart);
      carts[cartIndex] = cart;
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log("Producto agregado al carrito con éxito");
    } catch (error) {
      console.log(`Error en la función addCartsPg: ${error.message}`);
      throw error;
    }
  };

  discountQuantityPro = async (
    idCartEnQuan,
    idProductsCartQuan,
    quantitySearchProduct
  ) => {
    try {
      let idCartQuan = idCartEnQuan;
      let idProducQuan = Number(idProductsCartQuan);
      let quanSearch = Number(quantitySearchProduct);
      const busquedaCartDisc = await fs.promises.readFile(this.path, "utf-8");
      const cartRtaDisc = JSON.parse(busquedaCartDisc);
      const resultBusqCartDisc = cartRtaDisc.find(
        ({ _id }) => _id == idCartQuan
      );
      if (!resultBusqCartDisc) {
        console.log("El carrito no existe.");
        return;
      }
      const verifProductQuan = resultBusqCartDisc.products;
      const searchFilteredQuan = verifProductQuan.find(
        ({ producto }) => producto == idProducQuan
      );
      if (!searchFilteredQuan) {
        console.log("El producto no existe en el carrito.");
        return;
      }
      const indexCartDisc = verifProductQuan.indexOf(searchFilteredQuan);
      let newDescQuan = searchFilteredQuan.quantity - 1;
      const newQuanProductDisc = {
        producto: idProducQuan,
        quantity: newDescQuan,
        stock: searchFilteredQuan.stock,
        price: searchFilteredQuan.price,
        totalPrice: newDescQuan * searchFilteredQuan.price,
        title: searchFilteredQuan.title,
        description: searchFilteredQuan.description,
        code: searchFilteredQuan.code,
      };
      verifProductQuan.splice(indexCartDisc, 1, newQuanProductDisc);
      resultBusqCartDisc.totalCartPrice = await this.calculateTotalCartPrice(
        resultBusqCartDisc
      );
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(cartRtaDisc, null, 2)
      );
      console.log("Cantidad de producto disminuida con éxito");
    } catch (error) {
      console.log(`Error en la función discountQuantityPro: ${error.message}`);
      throw error;
    }
  };

  //--------------------CIEERE DE LA COMPRA DEL CARRITO------------------
  purchaseCart = async (req) => {
    try {
      const cartId = req.params.cid;
      let cart = await this.getIdCarts(cartId);
      console.log("Carrito encontrado:", cart);
      const productsNotPurchased = [];
      const productsPurchased = [];
      let totalTicketAmount = 0; 
      for (const cartItem of cart.products) {
        if (cartItem.stock === 0) {
          productsNotPurchased.push(cartItem);
        } else if (cartItem.stock > 0) {
          productsPurchased.push(cartItem);
        }
      }
      console.log("Productos sin stock:", productsNotPurchased);
      console.log("Productos con stock:", productsPurchased);
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);
      const cartIndex = carts.findIndex((cart) => cart._id === cartId);
      console.log(
        "🚀 ~ file: cartsManager.fs.js:672 ~ CartsManagerFs ~ purchaseCart= ~ cartIndex:",
        cartIndex
      );

      if (cartIndex === -1) {
        throw new Error("CartManager: Carrito no encontrado");
      }
      const cartPurchase = carts[cartIndex];
      console.log(
        "🚀 ~ file: cartsManager.fs.js:677 ~ CartsManagerFs ~ purchaseCart= ~ cartPurchase:",
        cartPurchase
      );
      const userData = await fs.promises.readFile(this.userPath, "utf-8");
      const users = JSON.parse(userData);
      const user = users.find((user) => user.cart === cartId);
      if (!user) {
        throw new Error("CartManager: Usuario no encontrado");
      }
      const purchaserEmail = user.email;
      console.log("Correo del comprador:", purchaserEmail);
      const productData = await fs.promises.readFile(
        this.productsPath,
        "utf-8"
      );
      const productsDatabase = JSON.parse(productData);
      for (const purchasedProduct of productsPurchased) {
        const productInDatabase = productsDatabase.find(
          (producto) => producto._id === purchasedProduct.producto
        );
        console.log(
          "🚀 ~ file: cartsManager.fs.js:885 ~ CartsManagerFs ~ purchaseCart= ~ productInDatabase:",
          productInDatabase
        );
        const productInDatabaseIndex = productsDatabase.findIndex(
          (producto) => producto._id === purchasedProduct.producto
        );
        console.log(
          "🚀 ~ file: cartsManager.fs.js:885 ~ CartsManagerFs ~ purchaseCart= ~ productInDatabase:",
          productInDatabaseIndex
        );

        if (productInDatabase) {
          console.log(
            `Producto comprado: ID ${productInDatabase._id}, Índice ${productInDatabaseIndex}, Stock ${productInDatabase.stock}`
          );
          const quantityDesc = purchasedProduct.quantity;
          const newStock = productInDatabase.stock - quantityDesc;
          totalTicketAmount += quantityDesc * productInDatabase.price;
          const updNewStock = {
            stockFind: productInDatabase.stock,
            quantityDesc: quantityDesc,
            newStock: newStock,
            _id: productInDatabase._id,
            index: productInDatabaseIndex,
          };
          console.log("Actualización de stock:", updNewStock);
          productsDatabase[productInDatabaseIndex].stock = newStock;
        } else {
          console.log(
            `Producto con ID ${purchasedProduct.producto} no encontrado en la base de datos.`
          );
        }
      }
      await fs.promises.writeFile(
        this.productsPath,
        JSON.stringify(productsDatabase, null, 2),
        "utf-8"
      );
      if (productsPurchased.length > 0) {
        const ticketData = {
          amount: totalTicketAmount,
          purchaser: user.email,
        };
        const ticket = await this.ticketManagerFs.addTicket(ticketData);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      }
      const updatedProducts = productsNotPurchased;
      await this.updateCartsComplet(cartId, updatedProducts);
      return {
        message:
          "Algunos productos no pudieron ser procesados por falta de stock",
        productsNotPurchased,
      };
    } catch (error) {
      console.error(`CartManager: Error al procesar la solicitud: ${error}`);
      throw error;
    }
  };

//--------------------UPDATE PRODUCT COMPLETO DEL CARRITO------------------

  updateCartsComplet = async (cartId, updatedProducts) => {
    try {
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);

      const cartIndex = carts.findIndex((cart) => cart._id === cartId);
      if (cartIndex === -1) {
        throw new Error(
          `CartManager: Carrito no encontrado con el ID ${cartId}`
        );
      }
      carts[cartIndex].products = updatedProducts;
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log(
        `CartManager: Se modificaron los productos del carrito con éxito: ${cartId}`
      );
      return carts[cartIndex];
    } catch (error) {
      console.error(
        `CartManager: No se puede procesar la actualización de productos del carrito: ${error}`
      );
      throw error;
    }
  };

//--------------------UPDATE UN PRODUCTO DEL CARRITO------------------

  updateCarts = async (productId, updatedData) => {
    try {
      const productData = await fs.promises.readFile(
        this.productsPath,
        "utf-8"
      );
      const productsDatabase = JSON.parse(productData);

      const productIndex = productsDatabase.findIndex(
        (product) => product._id === productId
      );

      if (productIndex !== -1) {
        productsDatabase[productIndex] = {
          ...productsDatabase[productIndex],
          ...updatedData,
        };
        await fs.promises.writeFile(
          this.productsPath,
          JSON.stringify(productsDatabase, null, 2),
          "utf-8"
        );
        console.log(`Producto actualizado con ID ${productId}.`);
      } else {
        console.log(
          `Producto con ID ${productId} no encontrado en la base de datos.`
        );
      }
    } catch (error) {
      console.error(`Error al actualizar el producto: ${error}`);
      throw error;
    }
  }

  //--------------------DELETE PRODUCT COMPLETO DEL CARRITO------------------
  deleteProductCarts = async (req) => {
    try {
      const idCart = req.params.cid;
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);
      const cartIndex = carts.findIndex((cart) => cart._id === idCart);
      if (cartIndex === -1) {
        throw new Error(
          `El carrito _id: ${idCart} buscado no existe, cargue un nuevo id`
        );
      }
      const cart = carts[cartIndex];
      cart.products = [];
      cart.totalCartPrice = await this.calculateTotalCartPrice(cart);
      carts[cartIndex] = cart;
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log("Productos eliminados del carrito con éxito");
      return cart;
    } catch (error) {
      console.log(
        `Error en la función deleteAllProductsFromCart: ${error.message}`
      );
      throw error;
    }
  };

  //--------------------DELETE PRODUCT DEL CARRITO------------------
  deleteOneProdCarts = async (req) => {
    try {
      const idCart = req.params.cid;
      const idProduct = req.params.pid;
      console.log(
        "🚀 ~ file: cartsManager.fs.js:454 ~ CartsManagerFs ~ deleteOneProdCarts ~ idProduct:",
        idProduct
      );
      const cartData = await fs.promises.readFile(this.path, "utf-8");
      const carts = JSON.parse(cartData);
      const resultBusqCartDel = carts.find(({ _id }) => _id == idCart);
      const cartIndex = carts.findIndex((cart) => cart._id === idCart);
      console.log(
        "🚀 ~ file: cartsManager.fs.js:458 ~ CartsManagerFs ~ deleteOneProdCarts ~ cartIndex:",
        cartIndex
      );
      if (cartIndex === -1) {
        throw new Error(
          `El carrito _id: ${idCart} buscado no existe, cargue un nuevo id`
        );
      }
      const cart = carts[cartIndex];
      const verifProductDel = resultBusqCartDel.products;
      const searchFilteredDel = verifProductDel.find(
        ({ producto }) => producto == idProduct
      );
      console.log(
        "🚀 ~ file: cartsManager.fs.js:471 ~ CartsManagerFs ~ deleteOneProdCarts ~ searchFilteredDe:",
        searchFilteredDel
      );
      const productIndex = verifProductDel.indexOf(searchFilteredDel);
      if (productIndex === -1) {
        console.log(
          `No se encontró el producto con _id: ${idProduct} en el carrito _id: ${idCart}`
        );
        return;
      }
      cart.products.splice(productIndex, 1);
      cart.totalCartPrice = await this.calculateTotalCartPrice(cart);
      carts[cartIndex] = cart;
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log(
        `El producto con _id: ${idProduct} en el carrito _id: ${idCart} se eliminó correctamente`
      );
      return cart;
    } catch (error) {
      console.log(
        `Error en la función deleteOneProductFromCart: ${error.message}`
      );
      throw error;
    }
  };
  
}

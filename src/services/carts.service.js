import { CART_REPOSITORY } from "../repository/respositoryManager.js"

class CartService {
    constructor(){    
        this.cartRepository = CART_REPOSITORY;
    }

    getIdCarts = async (req) => {
      try {
        const cartId = req.params.cid;
        const cart = await this.cartRepository.getIdCarts(cartId)
        return cart;
        }
       catch (error) {
        console.log(`CartService: no se pudo procesar la solcitud: ${error}`);
        throw error;
      }
  }

    getAllCarts = async (req) => { 
        try {
            let cartsFilter = await this.cartRepository.getAllCarts(req);
            return cartsFilter;
        } catch (error) {
            console.log(`cartService: no se pudo obtener carts: ${error}`)
            throw error;
        }
    }

  addToCart =  async(req) => {
    try {
        const addCartQuan = await this.cartRepository.addToCart(req);
        return addCartQuan;
    } catch (error) {
        console.log(`cartService: Error en addToCart  ${error}`)
        throw error;
    }
  }

  updateCarts = async(req) => {
    try {
      const updCartNew = await this.cartRepository.updateCarts(req);
      return updCartNew;
    } catch (error) {
      console.log(`cartService: Error en updateCarts ${error}`)
      throw error;
    }
  }

  updateCartsComplet = async (req) => { 
    try {
        const updCartNewComp = await this.cartRepository.updateCartsComplet(req);
        return updCartNewComp;
    } catch (error) {
        console.log(`cartService: Error en updateCartsComplet  ${error}`)
        throw error;
    }
  }

  deleteProductCarts  = async (req) => { 
    try {
        const cartDelete = await this.cartRepository.deleteProductCarts(req);
        return cartDelete;
    } catch (error) {
        console.log(`cartService: Error en deleteProductCarts ${error}`)
        throw error;
    }
  }

  deleteOneProdCarts = async (req) => { 
    try {
        const cartOnePrDelete = await this.cartRepository.deleteOneProdCarts(req);
        return cartOnePrDelete ;
    } catch (error) {
        console.log(`cartService: Error en deleteProductCarts ${error}`)
        throw error;
    }
  }

  purchaseCart = async (req) => {
    try {
    const realizarCompra = await this.cartRepository.purchaseCart(req);
    return realizarCompra;        
    } catch (error) {
    console.error(`sessionService: Error al procesar la solicitud: ${error}`);
    throw error;
    }
}

}

export default CartService;

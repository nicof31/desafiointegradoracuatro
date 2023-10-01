
export default class ProductRepository {
    constructor(dao) {
      this.dao = dao;
    }

    getIdProducts = async (id) => {
      try {
        console.log("🚀 ~ file: product.repository.js:10 ~ ProductRepository ~ getIdProducts ~ id:", id);
        const busquedaIdProd = await this.dao.productById(id);
        return busquedaIdProd;
      } catch (error) {
        console.log(`productRepository: Error en getIdProducts: ${error}`);
        throw error;
      }
    }

    getCombProducts = async (req) => {
      try {
        const busquedaCombProducts  = await this.dao.productCombId(req);
        console.log("🚀 ~ file: product.repository.js:22 ~ ProductRepository ~ getCombProducts= ~ busquedaCombProducts:", busquedaCombProducts)
        return busquedaCombProducts ;
      } catch (error) {
        console.log(`productRepository: Error en getCombProducts ${error}`);
        throw error;
      }
    }

    addToProduct = async (req) => {
      try {
        const newProduct = await this.dao.addProduct(req);     
        return newProduct;    
      } catch (error) {
        console.log(`productRepository: Error en addToProduct ${error}`);
        throw error;
      }
    }

    updateProductsComplet = async (req) => {
      try {
        const newUpdateCom = await this.dao.updateProductsComplet(req);     
        return newUpdateCom;    
      } catch (error) {
        console.log(`productRepository: Error en updateProductsComplet ${error}`);
        throw error;
      }
    }

    updateProductsPatch = async (req) => {
      try {
        const newObjUpdatePar = await this.dao.updateProductsPatch(req);     
        return newObjUpdatePar;    
      } catch (error) {
        console.log(`productRepository: Error en updateProductsPatch ${error}`);
        throw error;
      }
    }

    deleteProduct = async (req) => {
      try {
        const idProdDelet = req.params.pid;
        const productIdDelet = await this.dao.deleteProduct(idProdDelet);     
        return productIdDelet;    
      } catch (error) {
        console.log(`productRepository: Error en  productIdDelet ${error}`);
        throw error;
      }
    } 

    getProductsView  = async (req) => {
      try {
        const busquedaCombProducts  = await this.dao.getProductsView (req);
        return busquedaCombProducts ;
      } catch (error) {
        console.log(`productRepository: Error en getProductsView ${error}`);
        throw error;
      }
    }

}
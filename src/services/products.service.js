import { PRODUCT_REPOSITORY } from "../repository/respositoryManager.js";

class ProductsService { 
    constructor(){
        this.productRepository = PRODUCT_REPOSITORY;
    }

    getIdProducts = async (req, res) => {  
        try{
            const idProducts= req.params.pid;
            const busquedaIdProd = await this.productRepository.getIdProducts(idProducts)
            console.log(busquedaIdProd )
            if (busquedaIdProd .length == 0) {
                throw new Error(
                    `ProductService: El _id '${idProducts}' de producto buscado no existe, cargue un nuevo _id`
                );
            }
            return busquedaIdProd ;
        } catch (error) {
            console.log(`productService: No se puede procesar la peticion GET '${error}'`);
            throw error;  
        };
    };

    getCombProducts = async (req) => {
        try {
            const busquedaCombProducts  = await this.productRepository.getCombProducts(req);
            return busquedaCombProducts ;
        } catch(error) {
            console.log(`productService: Error al realizar la búsqueda paginada: ${error}`);
            throw error; 
        };
    };

    addToProduct = async(req) => {
        try {
            const newProduct = await this.productRepository.addToProduct(req);            
            return newProduct;
        } catch (error) {
            console.log(`productService: No se puede procesar la peticion POST '${error.message}'`);
            throw error;
        }
    }

    updateProductsComplet = async (req) => {
        try {
            const newObjUpdate = await this.productRepository.updateProductsComplet(req);            
            return newObjUpdate;
        } catch (error) {
            console.log(`productService: No se puede procesar la peticion PUT '${error}'`);
            throw error;  
        }
    }
       
    updateProductsPatch = async (req) => {
        try {
            const newObjUpdatePar = await this.productRepository.updateProductsPatch(req);            
            return newObjUpdatePar;
        } catch (error) {
            console.log(`productService: No se puede procesar la peticion PATCH '${error}'`);
            throw error;  
        }
    }

    deleteProduct =  async(req) => {
        try {
            const productIdDelet = await this.productRepository.deleteProduct(req);
            return productIdDelet;
        } catch (error) {
            console.error(`productService: error al procesar la petición DELETE: ${error}`);
            throw error;
        }
    }
}

export default ProductsService;

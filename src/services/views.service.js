import { PRODUCT_REPOSITORY } from "../repository/respositoryManager.js"

class ViewsService {
    constructor(){
        this.productRepository = PRODUCT_REPOSITORY
    }

    getProductsView = async (req) => {
        try {
            const busquedaCombProducts  = await this.productRepository.getProductsView(req);        
            return busquedaCombProducts ;
        } catch (error) {
            console.log(`viewService: no se pudo procesar la petición: '${error}'`)
            throw error;    
        }
    }
}


export default ViewsService;
import fs from "fs";

export default class ProductManagerFs {
  constructor() {
    this.path = "src/files/products.json";
    this.userPath ="src/files/users.json";
  }

  products = async () => {
    if (fs.existsSync(this.path)) {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const productRta = JSON.parse(data);
      return productRta;
    } else {
      return [];
    }
  };

  //--------------------GET------------------
  productById = async (idParm) => {
    try{
    const busquedaArr = await fs.promises.readFile(this.path, "utf-8");
    const productRtaId = JSON.parse(busquedaArr);
    const resultBusq = productRtaId.find(({ _id }) => _id == idParm);
    console.log("🚀 ~ file: productManager.fs.js:66 ~ ProductManagerFs ~ productById= ~ resultBusq:", resultBusq)
    if (!resultBusq ) {
      console.log('productManager: El id de producto buscado no existe, cargue un nuevo id')
      throw new Error('productManager: El id de producto buscado no existe, cargue un nuevo id');
    } else {
    return [resultBusq];
  } 
  }catch(error){
    console.log(`productManager: No se puede porcesar la busqueda ${error}`);
    throw error;
  };
  }

  productCombId = async (req) => {
    try {
      const limitDefault = 10;
      const pageDefault = 1;
      const findPage = parseInt(req.query.page) || parseInt(pageDefault);
      const findLimit = parseInt(req.query.limit) || parseInt(limitDefault);
      const sortOrder = req.query.sort == 'desc' ? -1 : 1;
      const queryCategory = req.query.category;
      const queryId = parseInt(req.query.id);
      const busquedaRta = await fs.promises.readFile(this.path, 'utf-8');
      const products = JSON.parse(busquedaRta);
      let filteredProducts = products;
      if (queryCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === queryCategory);
      }
      if (!isNaN(queryId)) {
        filteredProducts = filteredProducts.filter(product => product._id === queryId);
      }
      filteredProducts.sort((a, b) => (a.price - b.price) * sortOrder);
      const startIndex = (findPage - 1) * findLimit;
      const endIndex = startIndex + findLimit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredProducts.length / findLimit);
      const productsPagination = {
        docs: paginatedProducts,
        totalDocs: filteredProducts.length,
        limit: findLimit,
        totalPages,
        page: findPage,
        hasNextPage: findPage < totalPages,
        hasPrevPage: findPage > 1,
        prevLink: findPage > 1
          ? `http://localhost:8080/api/products/?page=${findPage - 1}&limit=5&sort=&category=${queryCategory || ''}&id=${queryId || ''}`
          : null,
        nextLink: findPage < totalPages
          ? `http://localhost:8080/api/products/?page=${findPage + 1}&limit=5&sort=&category=${queryCategory || ''}&id=${queryId || ''}`
          : null,
        isValid: !(findPage <= 0 || findPage > totalPages)
      };
      return productsPagination;
    } catch (error) {
      console.log(`productManager: No se puede procesar la búsqueda ${error}`);
      throw error;
    }
  }

  //--------------------ADD------------------
  addProduct = async (req  ) => {
    const crearProducto = req.body;
    let productGest = [];
    try {
    const data = await fs.promises.readFile(this.path, "utf-8");
    productGest = JSON.parse(data);
    const findCode = await this.products();
    const codeVerf = findCode.find(({ code })=> code == crearProducto.code);
      if (codeVerf != null) {
        console.log("el codigo del producto ya existe en otro producto")
        throw new Error('productManager: El codigo producto ya existe en la base de datos, asigne un codigo nuevo');
      } else {
        const users = req.user;
        console.log("🚀 ~ file: productManager.fs.js:98 ~ ProductManagerFs ~ addProduct= ~ users:", users)
        if (users.role === "USER" || users.role === "PUBLIC") {
          throw new Error("productManager: No tiene permiso para crear productos");
        }
        const product = {
          title: crearProducto.title,
          description: crearProducto.description,
          code: crearProducto.code,
          price: crearProducto.price,
          status: crearProducto.status,
          category: crearProducto.category,
          thumbnail: crearProducto.thumbnail || [],
          stock: crearProducto.stock,
          owner: users.role === "PREMIUM" ? users.id : "ADMIN",
        };
        if (productGest.length === 0) {
          product._id = 1;
        } else {
          product._id = productGest[productGest.length - 1]._id + 1;
        }
        const agregoIdObjP = productGest.push(product);
        const writeJson = await fs.promises.writeFile(
          this.path,
          JSON.stringify(productGest, null, "\t")
        );
      }
    } catch (error) {
      console.log(`No se puede crear el producto ${error}`);
      throw error;
    } 
  };
  
  //--------------------UPDATE------------------
  updateProductsComplet = async (req) => {
    try{
    const actualizarProducto = req.body;
    const idUpdate = req.params.pid;
    const busquedaArrUpdate = await fs.promises.readFile(this.path, "utf-8");
    const productRtaUp = JSON.parse(busquedaArrUpdate);
    const resultBusqUpdate = productRtaUp.find(({ _id }) => _id == idUpdate);
    const indiceUpdate = productRtaUp.indexOf(resultBusqUpdate);
    if(resultBusqUpdate == null){
      throw new Error('productManager: El id de producto buscado no existe, cargue un nuevo id');
    } else {
      const codDeProdBuscadoId = productRtaUp.find(({ code })=> code === actualizarProducto.code);
      if (codDeProdBuscadoId !=null){
      throw new Error('productManager: El código de producto existe en otro producto, cargue un nuevo código de producto');
      } 
    }
    const passThumbnail = actualizarProducto.thumbnail || resultBusqUpdate.thumbnail;
    const productUpdate = {
      title: actualizarProducto.title,
      description: actualizarProducto.description,
      code: actualizarProducto.code,
      price: actualizarProducto.price,
      status: actualizarProducto.status,
      category: actualizarProducto.category,
      thumbnail: passThumbnail,
      stock: actualizarProducto.stock,
      _id: resultBusqUpdate._id,
    };
    const updateProductoArray = productRtaUp.splice(
      indiceUpdate,
      1,
      productUpdate
    );
    const nuevoArrUp = productRtaUp;
    const writeUpdateP = await fs.promises.writeFile(
      this.path,
      JSON.stringify(nuevoArrUp, null, "\t")
    );
    return resultBusqUpdate;
  } catch (error){
    console.error(`productManager: error al procesar la petición PUT: ${error}`);
    throw error;
  }
}

updateProductsPatch = async (req) => {
    try {
      const updateParamPatch = req.body;
      const idUpdatePatch = req.params.pid;
      const busquedaParmUpdate = await fs.promises.readFile(this.path, { encoding: 'utf-8' });
      const productRtaUpParam = JSON.parse(busquedaParmUpdate);
      const resultBusqUpdateParam = productRtaUpParam.find(({ _id }) => _id == idUpdatePatch);
      console.log('resultBusqUpdateParam:', resultBusqUpdateParam);
      if (!resultBusqUpdateParam) {
        throw new Error(`No se encontró el producto con ID ${idUpdatePatch}`);
      }
      if (updateParamPatch.code) {
        const existingProductWithCode = productRtaUpParam.find(
          ({ code }) => code === updateParamPatch.code
        );
      if (existingProductWithCode && existingProductWithCode.id !== idUpdatePatch) {
          throw new Error(`El código '${updateParamPatch.code}' ya existe en otro producto`);
      }
      }
      Object.assign(resultBusqUpdateParam, updateParamPatch);
      await fs.promises.writeFile(this.path, JSON.stringify(productRtaUpParam, null, '\t'), { encoding: 'utf-8' });
      return resultBusqUpdateParam;
    } catch (error) {
      console.error(`productManager: error al procesar la petición PATCH: ${error}`);
      throw error;
    }
}

  //--------------------DELETE-----------------
deleteProduct = async (idDelete) => {
  try {
    const busquedaRtaDelete = await fs.promises.readFile(this.path, 'utf-8');
    const productRtaDelete = JSON.parse(busquedaRtaDelete);
    const resultBusqDelete = productRtaDelete.find(({ _id }) => _id == idDelete);
    if (!resultBusqDelete) {
      throw new Error(`No se encontró el producto con ID ${idDelete}`);
    }
    const indiceDelete = productRtaDelete.indexOf(resultBusqDelete);
    productRtaDelete.splice(indiceDelete, 1);
    await fs.promises.writeFile(this.path, JSON.stringify(productRtaDelete, null, '\t'));
    return resultBusqDelete;
  } catch (error) {
    console.log(`productManager: No se puede borrar el producto ${error}`);
    throw error;
  }
};

  //--------------------VISTA PARA RENDER /PRODUCTS----------------
getProductsView = async (req) => {
  try {
    const { first_name, last_name, email, role } = req.user.user;
    if (fs.existsSync(this.userPath)) {
      const userData = await fs.promises.readFile(this.userPath, "utf-8");
      const users = JSON.parse(userData);
      const existingUser = users.find((user) => user.email === email);
      if (!existingUser) {
        return { error: true, message: `userManagerFs: El usuario con el correo electrónico ${email} no existe` };
      }
      const limitDefault = 10;
      const pageDefault = 1;
      const findPage = parseInt(req.query.page) || parseInt(pageDefault);
      const findLimit = parseInt(req.query.limit) || parseInt(limitDefault);
      const sortOrder = req.query.sort == 'desc' ? -1 : 1;
      const queryCategory = req.query.category;
      const queryId = parseInt(req.query.id);
      const busquedaRta = await fs.promises.readFile(this.path, 'utf-8');
      const products = JSON.parse(busquedaRta);
      let filteredProducts = products;
      if (queryCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === queryCategory);
      }
      if (!isNaN(queryId)) {
        filteredProducts = filteredProducts.filter(product => product._id === queryId);
      }
      filteredProducts.sort((a, b) => (a.price - b.price) * sortOrder);
      const startIndex = (findPage - 1) * findLimit;
      const endIndex = startIndex + findLimit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredProducts.length / findLimit);
      const productsPagination = {
        docs: paginatedProducts,
        totalDocs: filteredProducts.length,
        limit: findLimit,
        totalPages,
        page: findPage,
        hasNextPage: findPage < totalPages,
        hasPrevPage: findPage > 1,
        prevLink: findPage > 1
          ? `http://localhost:8080/products/?page=${findPage - 1}&limit=5&sort=&category=${queryCategory || ''}&id=${queryId || ''}`
          : null,
        nextLink: findPage < totalPages
          ? `http://localhost:8080/products/?page=${findPage + 1}&limit=5&sort=&category=${queryCategory || ''}&id=${queryId || ''}`
          : null,
        isValid: !(findPage <= 0 || findPage > totalPages)
      };
      const userWithCart = {
        first_name,
        last_name,
        email,
        role,
        cart: existingUser.cart
      };
      return { user: userWithCart, productsPagination };
    } else {
      return { error: true, message: 'El archivo de usuarios no existe' };
    }
  } catch (error) {
    console.log(`productManager: No se puede procesar la búsqueda ${error}`);
    throw error;
  }
}

}

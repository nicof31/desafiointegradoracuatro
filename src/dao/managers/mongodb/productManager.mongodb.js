import productsModel from "../../models/products.model.js";
import UserModel from "../../models/users.model.js";

export default class ProductManagerMongo {
  constructor(path) {
    this.path = path;
    this.userModel = UserModel;
  }

  //--------------------GET---------------------
  productById = async (idProducts) => {
    try {
      const resultBusqC = await productsModel.find({ _id: idProducts });
      return resultBusqC;
    } catch (error) {
      console.log(`productManager: No se puede porcesar la busqueda ${error}`);
      throw error;
    }
  };

  productCombId = async (req) => {
    try {
      const limitDefault = 10;
      const pageDefault = 1;
      const findPage = parseInt(req.query.page) || parseInt(pageDefault);
      const findLimit = parseInt(req.query.limit) || parseInt(limitDefault);
      const sortOrder = req.query.sort == "desc" ? -1 : 1;
      const queryCategory = req.query.category;
      const queryId = parseInt(req.query.id);
      const findCategory = {};
      if (queryCategory) {
        findCategory.category = queryCategory;
      }
      if (queryId) {
        findCategory._id = queryId;
      }
      const findBdProd = {
        page: findPage,
        limit: findLimit,
        sort: { price: sortOrder },
        lean: true,
      };
      const productsPagination = await productsModel.paginate(
        findCategory,
        findBdProd
      );
      //le paso a respuesta de products los link
      productsPagination.prevLink =
        productsPagination.hasPrevPage === true
          ? `http://localhost:8080/api/products/?page=${productsPagination.prevPage}&limit=5&sort=&category=&id=`
          : null;

      productsPagination.nextLink =
        productsPagination.hasNextPage === true
          ? `http://localhost:8080/api/products/?page=${productsPagination.nextPage}&limit=5&sort=&category=&id=`
          : null;
      productsPagination.isValid = !(
        findPage <= 0 || findPage > productsPagination.totalPages
      );
      return productsPagination;
    } catch (error) {
      console.log(`productManager: No se puede porcesar la busqueda ${error}`);
      throw error;
    }
  };

//--------------------ADD---------------------
  addProduct = async (req) => {
    try {
      const crearProducto = req.body;
      const users = req.user;
      if (users.role === "USER" || users.role === "PUBLIC") {
        throw new Error("productManager: No tiene permiso para crear productos");
      }
      const findCode = await productsModel.find();
      const codeVerf = findCode.find(({ code }) => code == crearProducto.code);
      if (codeVerf != null) {
        throw new Error(
          "productManager: El codigo producto ya existe en la base de datos, asigne un codigo nuevo"
        );
      } else {
        let productGest = [];
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
        // genero el id autoincremental
        const findmaxIdBase = await productsModel.findOne(
          {},
          {},
          { sort: { _id: -1 } }
        );
        let idAutoGen;
        if (findmaxIdBase) {
          const maxId = findmaxIdBase._id;
          product._id = maxId + 1;
        } else {
          product._id = 1;
        }
        productGest.push(product);
        await productsModel.create(productGest);
        console.log(`Creación del producto exitosa`);
        return {
          status: "success",
          message: "productManager: Producto creado exitosamente",
        };
      }
    } catch (error) {
      console.log(`productManager: No se puede crear el producto ${error}`);
      throw error;
    }
  };

  
//--------------------UPDATE---------------------
  updateProductsComplet = async (req) => {
    try {
      const actualizarProducto = req.body;
      const idUpdate = req.params.pid;
      const findCodeUpC = await productsModel.find();
      const idFindUpdate = findCodeUpC.find(({ _id }) => _id == idUpdate);
      if (idFindUpdate == null) {
        throw new Error(
          "productManager: El id de producto buscado no existe, cargue un nuevo id"
        );
      } else {
        const codDeProdBuscadoId = findCodeUpC.find(
          ({ code }) => code === actualizarProducto.code
        );
        if (codDeProdBuscadoId != null) {
          throw new Error(
            "productManager: El código de producto existe en otro producto, cargue un nuevo código de producto"
          );
        }
      }
      const passThumbnail =
        actualizarProducto.thumbnail || idFindUpdate.thumbnail;
      const productUpdate = {
        title: actualizarProducto.title,
        description: actualizarProducto.description,
        code: actualizarProducto.code,
        price: actualizarProducto.price,
        status: actualizarProducto.status,
        category: actualizarProducto.category,
        thumbnail: passThumbnail,
        stock: actualizarProducto.stock,
        _id: idUpdate,
      };
      await productsModel.updateOne({ _id: idUpdate }, productUpdate);
      console.log(`Actualización del producto id: '${idUpdate}' exitoso`);
      return productUpdate;
    } catch (error) {
      console.error(
        `productManager: error al procesar la petición PUT: ${error}`
      );
      throw error;
    }
  };

  updateProductsPatch = async (req) => {
    try {
      const updateParamPatch = req.body;
      const idUpdatePatch = req.params.pid;
      const findCodeUpdatePatch = await productsModel.find();
      const idVerfUpdatePatch = findCodeUpdatePatch.find(
        ({ _id }) => _id == idUpdatePatch
      );
      if (idVerfUpdatePatch == null) {
        throw new Error(
          "productManager: El id de producto buscado no existe, cargue un nuevo id"
        );
      } else {
        const codDeProdPatchId = findCodeUpdatePatch.find(
          ({ code }) => code == req.body.code
        );
        if (codDeProdPatchId != null) {
          throw new Error(
            "productManager: El código de producto existe en otro producto, cargue un nuevo código de producto"
          );
        }
      }
      const updatedProduct = await productsModel.findOneAndUpdate(
        { _id: idUpdatePatch },
        { $set: updateParamPatch },
        { new: true }
      );
      console.log(
        `productManager: Actualización parcial del producto id: '${idUpdatePatch}' exitosa`
      );
      return updatedProduct;
    } catch (error) {
      console.error(
        `productManager: error al procesar la petición PATCH: ${error}`
      );
      throw error;
    }
  };


//-------------------DELETE---------------------
  deleteProduct = async (idDelete) => {
    try {
      const findCodeDelete = await productsModel.find();
      const idVerfDelete = findCodeDelete.find(({ id }) => id == idDelete);
      if (idVerfDelete == null) {
        throw new Error(
          "productManager: El id de producto buscado no existe, cargue un nuevo id"
        );
      }
      await productsModel.deleteOne({ _id: idDelete });
      console.log(
        `productManager: Borrado del producto id: '${idDelete}' exitoso`
      );
    } catch (error) {
      console.log(`productManager: No se puede borrar el producto ${error}`);
      throw error;
    }
  };

  //--------------------VISTA PARA RENDER /PRODUCTS----------------
  getProductsView = async (req) => {
    try {
      const { first_name, last_name, email, role, cart } = req.user.user;
      const userFindCart = await this.userModel.findOne({ email }).exec();
      const limitDefault = 10;
      const pageDefault = 1;
      const findPage = parseInt(req.query.page) || parseInt(pageDefault);
      const findLimit = parseInt(req.query.limit) || parseInt(limitDefault);
      const sortOrder = req.query.sort == "desc" ? -1 : 1;
      const queryCategory = req.query.category;
      const queryId = parseInt(req.query.id);
      const findCategory = {};
      if (queryCategory) {
        findCategory.category = queryCategory;
      }
      if (queryId) {
        findCategory._id = queryId;
      }
      const findBdProd = {
        page: findPage,
        limit: findLimit,
        sort: { price: sortOrder },
        lean: true,
      };
      const productsPagination = await productsModel.paginate(
        findCategory,
        findBdProd
      );
      productsPagination.prevLink =
        productsPagination.hasPrevPage === true
          ? `http://localhost:8080/products/?page=${productsPagination.prevPage}&limit=5&sort=&category=&id=`
          : null;
      productsPagination.nextLink =
        productsPagination.hasNextPage === true
          ? `http://localhost:8080/products/?page=${productsPagination.nextPage}&limit=5&sort=&category=&id=`
          : null;
      productsPagination.isValid = !(
        findPage <= 0 || findPage > productsPagination.totalPages
      );
      const userWithCart = {
        first_name,
        last_name,
        email,
        role,
        cart: userFindCart.cart,
      };
      return { user: userWithCart, productsPagination };
    } catch (error) {
      console.log(
        `productManager: Error al realizar la búsqueda paginada: ${error}`
      );
      throw error;
    }
  };

}

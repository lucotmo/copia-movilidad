import { fetchData } from "../../global/helpers";
import { WISHLIST_MD_ACRO } from "../../global/constants";

/**
 * Servicio principal del wishlist
 * @module wishlist.service
 */

/**
 * @namespace
 * @property {Object} addProduct - Recurso para agregar a la lista un producto por SKU
 * @property {Object} toggleDeleteProduct - Recurso para agregar/eliminar un producto de la lista
 */
let resources = {
    addProduct: async (data, success, error) => {
        try {
            const res = await fetchData(`/api/dataentities/${WISHLIST_MD_ACRO}/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data }),
            });
            success(res);
        } catch (err) {
            error(err);
        }
    },
    toggleDeleteProduct: (id, deletedStatus) =>
        fetchData(`/api/dataentities/${WISHLIST_MD_ACRO}/documents/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Isdelete: deletedStatus }),
        })
};

/**
 * Agrega un producto a la lista de deseados en el Master Data
 * @param {Object} product - Producto a agregar a la lista
 * @param {object} product.productID - ID del producto a agregar a la lista
 * @param {object} product.ProductId - SKU del producto a agregar a la lista
 * @param {function} success - Función a llamar en caso de éxito
 * @param {function} error - Función a llamar en caso de error
 */
function addProduct(data, success, error) {
    let wishlist = getWishlist();
    if (!wishlist) {
        // Init the wishlist
        wishlist = new Array();
        setWishlist(wishlist);
    }

    let productInList = wishlist.filter((wlProduct) => {
        return Number(wlProduct.ProductId) === Number(data.ProductId);
    })[0];

    if (productInList) {
        if (productInList.Isdelete) {
            resources
                .toggleDeleteProduct(productInList.id, false)
                .then(function () {
                    updateLocalDeletedStatus(productInList.id, false, success, error);
                })
                .catch((err) => error(err));
        } else {
            error("Already_Exist");
        }
    } else {
        resources.addProduct(
            data,
            function (res) {
                if (res.Message) return;
                data.id = res.Id.slice(3);
                addProductToLocalWishlist(data, success, error);
            },
            error
        );
    }
}

/**
 * Agrega un producto a la lista de deseados de forma local
 * @param {Object} product - Producto a agregar a la lista
 * @param {object} product.productID - ID del producto a agregar a la lista
 * @param {object} product.productSKU - SKU del producto a agregar a la lista
 * @param {function} success - Función a llamar en caso de éxito
 * @param {function} error - Función a llamar en caso de error
 */
function addProductToLocalWishlist(product, success, error) {
    let wishlist = getWishlist();
    if (!wishlist) {
        error("No_Wishlist");
        return;
    }
    wishlist.push(product);
    setWishlist(wishlist);
    success();
}

/**
 * Actualiza el estado de eliminado de un producto
 * @param {number} id - ID del producto a actualizar
 * @param {boolean} status - Indica si el producto ha sido eliminado
 * @param {function} success - Función a llamar en caso de éxito
 * @param {function} error - Función a llamar en caso de error
 */
function updateLocalDeletedStatus(id, status, success, error) {
    let wishlist = getWishlist();
    if (!wishlist) {
        error("No_Wishlist");
        return;
    }
    let productFound;
    wishlist.forEach((wlProduct, index) => {
        if (wlProduct.id === id) {
            productFound = index;
        }
    });

    if (typeof productFound === "undefined") {
        error("Product_Not_Found");
        return;
    }

    wishlist[productFound].Isdelete = status;
    setWishlist(wishlist);
    success();
}

/**
 * Elimina un producto de la lista de deseados
 * @param {string} productId - ID del producto a eliminar a la lista
 * @param {function} success - Función a llamar en caso de éxito
 * @param {function} error - Función a llamar en caso de error
 */
function removeProduct(productId, success, error) {
    let wishlist = getWishlist();

    if (!wishlist) {
        error("No_Wishlist");
        return;
    }

    let productFound = wishlist.filter((wsProduct) => {
        return Number(wsProduct.ProductId) === Number(productId);
    })[0];

    if (typeof productFound === "undefined") {
        error("Product_Not_Found");
        return;
    }

    if (productFound.Isdelete) {
        error("Already_deleted");
        return;
    }

    if (productFound.id)
        resources
            .toggleDeleteProduct(productFound.id, true)
            .then(function () {
                updateLocalDeletedStatus(productFound.id, true, success, error);
            })
            .catch((err) => error(err));
    else error("Product_Id_Not_Found");
}

/**
 * Busca un producto por SKU en una lista de productos
 * @param {array} productsList - Listado de productos
 * @param {number} productId - Id del producto a buscar
 * @return {object | null} Retorna un producto en caso de encontrarlo, de lo contrario retorna indefinido
 */
function findProductById(productsList, productId) {
    if (!productsList) {
        return null;
    }
    const product = productsList.filter((product) => {
        return Number(product.ProductId) === Number(productId);
    });
    return product.length ? product[0] : null; 
}

/**
 * Carga la lista de deseados del usuario actual
 * @param {function} userEmail - Correo del usuario asociado a la lista
 */
async function loadWishlist(userEmail) {
    let localWishlist = getWishlist();
    let wishlistValidTo = localStorage.wishlistValidTo;

    const timestamp = new Date().getTime();

    if (localWishlist && parseInt(wishlistValidTo) > timestamp) return localWishlist;

    let products = await fetchData(
        `/api/dataentities/${WISHLIST_MD_ACRO}/search?Email=${userEmail}&_fields=ProductId,Email,id,Isdelete`
    );
    if (products.length === 0) return;

    setWishlist(products);
    return JSON.parse(localStorage.getItem("wishlist"));
}

/**
 * Obtiene la lista de deseados local del usuario
 * @return {array | undefined} Retorna el listado de productos en la lista en caso de existir localmente y estar
 * vigente, en caso contrario retorna indefinido
 */
function getWishlist() {
    let wishlist = localStorage.wishlist;

    if (wishlist) return JSON.parse(wishlist);
    else return undefined;
}

/**
 * Actualiza en forma local la lista de deseados
 * @param {array} wishlist - Listado de productos agregados al carrito
 */
function setWishlist(wishlist) {
    localStorage.wishlist = JSON.stringify(wishlist);
    localStorage.wishlistValidTo = new Date().getTime() + 7200000;
}

let services = {
    addProduct: addProduct,
    removeProduct: removeProduct,
    loadWishlist: loadWishlist,
    getWishlist: getWishlist,
    findProductById: findProductById,
};

export default services;

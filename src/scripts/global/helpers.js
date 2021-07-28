import Toastify from "toastify-js";
import fetch from "unfetch";
import { formatMoney, formatNumber } from "accounting-js";

import { 
    FORMAT_MONEY_DEFAULTS, 
    FORMAT_NUMBER_DEFAULTS, 
    SC_MIDDLE_URL, 
    VTEX_STOREID_FIELD,
    SC_MIDDLE_API,
    RECOMEND_CLUSTER_ID,
    MK_ID,
} from "./constants";
import { UserServices } from "./user";
import WishlistServices from "../vendor/services/wishList";

const clearWishlist = () => {
    localStorage.removeItem("wishlist");
    localStorage.removeItem("wishlistValidTo");
};

export const _formatMoney = (number) => formatMoney(number, FORMAT_MONEY_DEFAULTS);
export const _formatNumber = (number) => formatNumber(number, FORMAT_NUMBER_DEFAULTS);

export const showToastifyMessage = ({ message, blockRepeat, type}) => {
    // const typeClasses = { alert: "bc-toast--alert" };

    if (blockRepeat && $(".bc-toast").length) return;

    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "center",
        positionLeft: false,
        backgroundColor: "#fff",
        stopOnFocus: true,
        className: `bc-toast bc-toast--${type}`,
        offset: {
            y: '-15px'
          },
    }).showToast();
};

export const updateQueryStringParam = ({ key, value, useHref }) => {
    const baseUrl = [location.protocol, "//", location.host, location.pathname].join("");
    const urlQueryString = document.location.search;
    const newParam = key + "=" + value;
    let params = "?" + newParam;

    if (urlQueryString) {
        const keyRegex = new RegExp("([?&])" + key + "[^&]*");

        if (urlQueryString.match(keyRegex) !== null) params = urlQueryString.replace(keyRegex, "$1" + newParam);
        else params = urlQueryString + "&" + newParam;
    }

    if (useHref) window.location.href = baseUrl + params;
    else window.history.replaceState({}, "", baseUrl + params);
};

export async function fetchData(url, options = {}) {
    let res = await fetch(url, options)
        .then(function checkStatus(response) {
            if (response.ok) {
                return response;
            } else {
                var error = new Error(response.statusText);
                error.response = response;
                // return response;
                return Promise.reject(error);
            }
        })
        .then((res) => {
            if (res.status === 204) return "";
            else return res.json();
        });

    return res;
}

export const storeID = (() => ({
    isStoreIDInHref: () => window.location.search.includes(VTEX_STOREID_FIELD),
    getStoreID: () => window.location.search.split(`${VTEX_STOREID_FIELD}:`)[1],
}))();

export const goBack = (e) => {
    if (window.history.length > 2) window.history.back();
    else window.location.href = "/";

    e && e.preventDefault();
};

export const getLocalStorageProperty = (item, key) => {
    const data = JSON.parse(localStorage.getItem(item));

    if (data === null) return null;
    else return data[key];
};

export const updateLocalStorageProperty = (item, key, value) => {
    let data = localStorage.getItem(item);
    data = data ? JSON.parse(data) : {};

    data[key] = value;
    localStorage.setItem(item, JSON.stringify(data));
};

export const isIE = () => typeof window.document.documentMode !== "undefined";

export const clearCart = () =>
    $.Deferred(function (def) {
        vtexjs.checkout
            .getOrderForm()
            .done(function (orderForm) {
                if (orderForm.items.length) {
                    return vtexjs.checkout.removeAllItems(orderForm.items).done(function (orderForm) {
                        return def.resolve(orderForm);
                    });
                }
                return def.resolve(orderForm);
            })
            .fail(function (err) {
                return def.reject(err);
            });
    }).promise();

export const login = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("jws")) url.searchParams.delete("jws");
    if (url.searchParams.get("section")) url.searchParams.delete("section");
    const returnUrl = url.searchParams.get("redirectUrl") || url.href;
    vtexid.start({ returnUrl });
};

export const logout = async () => {
    localStorage.removeItem("userData");
    clearWishlist();

    await clearCart();
    await $.ajax({ url: '/no-cache/user/logout', cache: false });

    const returnUrl = window.location.href.indexOf("secure") > -1 ? window.location.origin : window.location.href;
    window.location.href = `${SC_MIDDLE_URL}/login/logout?returnUrl=${returnUrl}`;
};

export const getRecoments = async () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    let result = [];
    if (user && user.isUserDefined) { 
        const Recoments = await fetch(`${SC_MIDDLE_API.recoments}?email=${user.userEmail}&marketplaceId=${MK_ID}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", authorization: `Bearer ${user.userToken}` },
        });
        result = await Recoments.json();
        if (!Recoments.ok || result.length === 0) {
            const Search = await fetch(`/api/catalog_system/pub/products/search?fq=productClusterIds:${RECOMEND_CLUSTER_ID}&O=OrderByReleaseDateDESC`, {
                method: "GET",
            });
            result = await Search.json();
        }
    } else {
        const Search = await fetch(`/api/catalog_system/pub/products/search?fq=productClusterIds:${RECOMEND_CLUSTER_ID}&O=OrderByReleaseDateDESC`, {
            method: "GET",
        });
        result = await Search.json();
    }

    return result;
};

/**
 * Captura los eventos de wishlist tanto en página de producto, como en vitrinas.
 * Para el uso en página de producto se debería cumplir lo siguiente:
 * 1. La información del producto es global en VTEX mediante el objeto "productInfo"
 * 2. Se dispone de un data-set en el contenedor de producto y se llaman las opciones de vitrina*
 *
 * @param {object} options
 * @param {string | undefined} options.container [Shelf] Nombre del contenedor
 * @param {string} options.button Nombre del botón para agregar/eliminar de la lista de deseos
 * @param {string | undefined} options.dataSelector [Shelf] Nombre del data-selector que contiene el Id de producto, por defecto "productid"
 */
export async function handleWishlist({ container, button, dataSelector }) {
    const user = UserServices.getUserData();

    const resolveProductId = ($container) => {
        if ($container) return $container.data(dataSelector || "productid");
        else return window.productInfo.productId;
    }

    if (user && user.isUserDefined) {
        try {
            const wishlist = await WishlistServices.loadWishlist(user.userEmail);

            $(container ? `${container} ${button}` : button).each(function () {
                const item = $(this);
                if (item.hasClass("js-wish-handled")) return;

                const productId = resolveProductId(container ? item.parents(container) : null);
                const productInWish = wishlist && WishlistServices.findProductById(wishlist, productId);

                if (productInWish && !productInWish.Isdelete) {
                    item.addClass("active");
                }

                item.on("click", async function (e) {
                    const wishlist = await WishlistServices.loadWishlist(user.userEmail);
                    const productInWish = wishlist && WishlistServices.findProductById(wishlist, productId);

                    if (productInWish && !productInWish.Isdelete) {
                        WishlistServices.removeProduct(
                            productId,
                            () => {
                                item.removeClass("active");
                                showToastifyMessage({
                                    message: "Has eliminado este vehículo de tu listado de favoritos",
                                    blockRepeat: true,
                                    type: "alert"
                                });
                            },
                            (err) => {
                                console.warn("Wishlist error:", err);
                            }
                        );
                    } else {
                        const body = {
                            ProductId: productId,
                            Email: user.userEmail,
                            Isdelete: false,
                        };
                        WishlistServices.addProduct(
                            body,
                            () => {
                                item.toggleClass("active");
                                showToastifyMessage({
                                    message: "Has agregado este vehículo a tu listado de favoritos",
                                    blockRepeat: true,
                                    type: "alert"
                                });
                            },
                            (err) => {
                                showToastifyMessage({
                                    message: "No se pudo agregar el producto a favoritos",
                                    blockRepeat: true,
                                    type: "alert"
                                });
                                console.warn("Wishlist error:", err);
                            }
                        );
                    }
                    e.preventDefault();
                });

                item.addClass("js-wish-handled");
            });
        } catch (error) {
            console.warn("Wishlist error:", error);
        }
    } else {
        $(container ? `${container} ${button}` : button).each(function () {
            $(this).on("click", () =>
                showToastifyMessage({
                    message: "Para guardar tus vehículos favoritos debes iniciar sesión y los podrás encontrar en tu perfil.",
                    blockRepeat: true,
                    type: "alert"
                })
            );
        });
    }
};

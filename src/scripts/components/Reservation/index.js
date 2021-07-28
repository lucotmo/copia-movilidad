import { h } from "preact";
import fetch from "unfetch";
import { UserServices } from "../../global/user";

import { SC_API_URL, MK_ID } from "../../global/constants";
import { _formatNumber, _formatMoney, showToastifyMessage, login } from "../../global/helpers";

const BCReservation = ({ product }) => {
    const onReservationFails = (index) => {
        showToastifyMessage({
            message: "Lo sentimos, no podemos reservar el vehículo en este momento.",
            blockRepeat: true,
            type: "alert"
        });

        vtexjs.checkout.removeItems([{ index, quantity: 0 }]);
    };

    const handleAddToCart = (e) => {
        UserServices.validateUser(
            () => {
                const vtexCheckout = vtexjs.checkout;
                const item = {
                    id: product.items[0].itemId,
                    quantity: 1,
                    seller: product.items[0].sellers[0].sellerId,
                    // FIXME: Change this seller Id
                    // seller: product["Id Seller"] ? product["Id Seller"][0] : product.seller.idSellerVtex || 1,
                };

                if (product["Valor para reservar"] && !!product["Valor para reservar"][0])
                    vtexCheckout.getOrderForm().then((orderForm) => {
                        if (orderForm.items.filter((prod) => prod.id === product.items[0].itemId)[0]) {
                            return (window.location.href = "/checkout");
                        }
                        vtexCheckout.addToCart([item], null, 1).done((orderForm) => {
                            const itemIndex = orderForm.items.findIndex((item) => item.id === product.items[0].itemId);
                            const vtexSkuId = orderForm.items[itemIndex].id;
                            const { orderFormId } = orderForm;

                            fetch(`${SC_API_URL}/order/api/orders-core/update-cart-change-price?marketplaceId=${MK_ID}`, {
                                headers: {
                                    "Content-type": "application/json",
                                },
                                method: "PUT",
                                body: JSON.stringify({ itemIndex, vtexSkuId, orderFormId }),
                            })
                                .then((res) => {
                                    if (res.status === 200) window.location.href = "/checkout";
                                    else onReservationFails(itemIndex);
                                })
                                .catch(() => onReservationFails(itemIndex));
                        });
                    });
                else onReservationFails();
            },
            () => {
                login();
                return $(".procesoReservaOnline .js-toggle-modal")[0].click();
            }
        );

        e.preventDefault();
    };

    const price = product.items[0].sellers[0].commertialOffer.BestPrice || product.items[0].sellers[0].commertialOffer.ListPrice;
    let sellerName = "Bancolombia";

    if (product.seller) {
        sellerName = product.seller.sellerName;
    } else if (product.items[0].sellers[0]) {
        sellerName = product.items[0].sellers[0].sellerName.toLowerCase();
    }

    return (
        <div className="procesoReservaOnline bc-modal__wrapper hidden">
            <div className="separacionOnline bc-modal">
                <span className="close-modal fenix-icon-error js-toggle-modal" data-modal="procesoReservaOnline"></span>
                <div className="separacionOnline__contentSeparacion">
                    <title>¿Encontraste el carro que quieres?</title>
                    <div className="valorSeparacion">
                        <p>
                            Reserva este vehículo en <span>{sellerName}</span> con
                            <span>
                                {product["Valor para reservar"] ? _formatMoney(parseInt(product["Valor para reservar"][0])) : "-"}
                            </span>
                        </p>
                    </div>
                    <div className="infoProduct">
                        <div className="image">
                            <img src={product.items[0].images[0].imageUrl} alt={product.items[0].images[0].imageText} />
                        </div>
                        <div className="info">
                            <div className="estado">{product.Condición || "-"}</div>
                            <div className="productName">{product.productName}</div>
                            <div className="moreInfo">
                                <div>{product.Modelo}</div>
                                <div>{_formatNumber(product.KM) || "-"} km</div>
                                <div>{product.Departamento || "-"}</div>
                            </div>
                            <div className="productPrice">{_formatMoney(price)}</div>
                            <div className="sellerName">
                                <p>Vende:</p>
                                <span>{sellerName}</span>
                            </div>
                        </div>
                    </div>
                    <p className="infoProcess">
                        {/* Una vez finalices el proceso <span className="SellerReserva">{sellerName}</span> se pondrá en contacto contigo,
                        para continuar el proceso de compra. */}
                        Después del pago de la reserva, el vehículo será retirado de la venta y nos podremos en contacto contigo para continuar con el proceso de compra.
                    </p>
                    <span>*Aplican términos y condiciones.</span>
                    <div className="sectionButtons">
                        <button className="bc-btn-primary" onClick={handleAddToCart}>
                            Reservar ahora
                        </button>
                        <button className="bc-btn-secundary-white js-toggle-modal" data-modal="procesoReservaOnline">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BCReservation;

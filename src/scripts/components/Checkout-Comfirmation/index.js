import { h, Component } from "preact";
import BCC_Product from './Product'

export default class BCCcomfirmation extends Component {
  
    initialState = {  };

    constructor(props) {
        super(props);
        this.state = {
            orderNumber: this.props.orderNumber,
            products:[],
            shippingData:{},
            paymentData:{},
            tax:null,
            ship:null,
            logInfo:null,
            btotal:null,
            stotal:null
        }
    }

    componentDidMount() {
        $.ajax({
            type: "GET",
            url: "/api/checkout/pub/orders/order-group/"+this.props.orderNumber,
            contentType: "application/json",
            dataType: "json",
        }).done((response) => {
            let splited = response[0].shippingData.logisticsInfo[0].slas[0].shippingEstimate.split("b");
            const totalItems = response[0].totals.filter((tl) => tl.id === "Items")[0];
            const totalDisc = response[0].totals.filter((tl) => tl.id === "Discounts")[0];
            const totalShip = response[0].totals.filter((tl) => tl.id === "Shipping")[0];
            this.setState({
                products: response[0].items,
                shippingData: response[0].shippingData.address,
                paymentData: response[0].paymentData.transactions[0].payments[0],
                logInfo: splited[0],
                // tax: new Intl.NumberFormat(["ban", "id"]).format(totalTax.value / 100),
                stotal: new Intl.NumberFormat(["ban", "id"]).format((totalItems.value + (totalDisc.value || 0))),
                ship: new Intl.NumberFormat(["ban", "id"]).format(totalShip.value),
                btotal: new Intl.NumberFormat(["ban", "id"]).format(
                    (totalShip.value + totalItems.value + (totalDisc.value || 0))
                ),
            });

            $('.bc-modal__wrapper.fullpage-loader').remove();
        }); 
    }

    componentDidUpdate() {
    }

    render(_, state) {
        const { products, shippingData, paymentData, ship, btotal, stotal, logInfo  } = state;
        return (
            <div id="app-container2">
                <div class="bc-ccleft-box">
                    <div class="bc-products-list mini-cart">
                        <div class="bcg-title">Reserva realizada con éxito <i class="icon-check"></i></div>
                        <ul>
                            {products.map((product) =>
                                <BCC_Product p_id={product.productId} priced={product.manualPrice} qty={product.quantity}></BCC_Product>
                            )}
                            <a class="bc-more">Ver más información</a>
                        </ul>
                    </div>
                    <div class="bc-descriptions mini-cart">
                        <div class="cc-shipping">
                            <div class="s-title"> <i class="icon-home"> </i>Envío</div>
                            <div class="s-small-title"> Dirección </div>
                            <div class="s-paraph">Cll {shippingData.street} # {shippingData.number}, {shippingData.city}, {shippingData.state} </div>
                            <div class="s-paraph to">Envio hasta {logInfo} dias habiles - <strong>${ship}</strong></div>
                        </div>
                        <div class="cc-payment">
                            <div class="s-title"> <i class="icon-credit-card"></i>Medio de Pago</div>
                            <div class="s-small-title"> Medio de pago para esta compra</div>
                            <div class="s-paraph">{paymentData.paymentSystemName} ${new Intl.NumberFormat(["ban", "id"]).format(parseInt(paymentData.value) / 100)}</div>
                        </div>
                    </div>
                </div>
                <div class="bc-ccright-box">
                    <div class="bc-resume mini-cart">
                        <div class="r-title">Resumen de la reserva </div>
                        <ul class="box-resume">
                            <li>
                                <div class="r-subtitle">Subtotal</div>
                                <div class="r-cost">${stotal} </div>
                            </li>
                            <li>
                                <div class="r-subtitle">Impuestos</div>
                                <div class="r-cost">${ship}</div>
                            </li>
                            <li class="totals">
                                <div class="r-subtitle">Total a pagar</div>
                                <div class="r-cost">${btotal}</div>
                            </li>
                        </ul>
                    </div>
                    <div class="bc-resume-actions">
                        <a href="/" class="btn btn-success">Continuar navegando </a>
                        <a href="/" class="link-choose-more-products">ir a mis pedidos <i class="icon-chevron-left"></i></a>
                    </div>
                </div>
            </div>
        );
    } 
}

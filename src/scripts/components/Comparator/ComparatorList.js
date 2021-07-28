import { h, Component, Fragment } from "preact";
import { subscribe } from "pubsub-js";

import Comparator from "./index";
import ComparatorServices from "../../base/comparator";
import { showToastifyMessage } from "../../global/helpers";
import { PUBSUB_COMPARATOR, LS_COMPARATOR } from "../../global/constants";

export default class ComparatorList extends Component {
    breakPoint = 1024;
    constructor(props) {
        super(props);

        const listPlaceholder = [];
        const placeHolderLimit = window.screen.width < this.breakPoint ? LS_COMPARATOR.maxItemsMobile : LS_COMPARATOR.maxItemsDesktop;
        for (let i = 0; i < placeHolderLimit; i++) listPlaceholder.push(i);

        this.state = { productList: ComparatorServices.getProductList() || [], listPlaceholder, isComparatorMode: false };
    }

    handleToggleComparator = () => {
        const { productList } = this.state;
        if (window.screen.width < this.breakPoint) {
            this.setState((prevState) => ({ isComparatorMode: !prevState.isComparatorMode }));
            if ($('body').hasClass("comparator")){
                $('.comparator').removeClass('comparator');
            } else {
                $('body').addClass('comparator');
            }
        } else if (productList.length > 1) {
            window.location.href = "/compare";
        }
    };

    componentDidMount() {
        subscribe(PUBSUB_COMPARATOR.add, (_, productList) => this.setState({ productList }));
        subscribe(PUBSUB_COMPARATOR.remove, (_, productList) => this.setState({ productList }));
        subscribe(PUBSUB_COMPARATOR.clear, () => this.setState({ productList: [] }));
        subscribe(PUBSUB_COMPARATOR.error, (_, err) => {
            if (typeof err === "string") showToastifyMessage({ message: err, blockRepeat: true, type: "alert" });
            else console.warn(err);
        });
    }

    render(_, state) {
        const { productList, listPlaceholder, isComparatorMode } = state;

        if (isComparatorMode)
            return (
                <div className="comparator">
                    <Comparator onClose={this.handleToggleComparator} />
                </div>
            );
        else if (productList.length)
            return (
                <div className="prods">
                    <div class="swipeComparator"></div>
                    {listPlaceholder.map((index) => {
                        const product = productList[index];

                        if (product)
                            return (
                                <Fragment>
                                    <div className="prod-item">
                                        <div className="prod-content">
                                            <div className="prod-item__img">
                                                <img src={product.image} alt="Product Image" />
                                            </div>
                                            <div className="info-item">
                                                <div className="prod-status">{product.status}</div>
                                                <div className="hint--bottom hint--rounded" aria-label={product.name}>
                                                  <div className="prod-item__name">{product.name}</div>
                                                </div> 
                                                <div className="prod__specs">
                                                    <div>{product.model}</div>
                                                    <div>{product.km} km</div>
                                                    <div className="last">{product.location}</div>
                                                </div>
                                                <div className="prod__price">{product.price}</div>
                                            </div>
                                        </div>
                                        <div
                                            className="btn-product-delete"
                                            onClick={() => ComparatorServices.removeProduct(product.id)}
                                        >
                                            <p>Eliminar</p>
                                            <span className="icon"></span>
                                        </div>
                                    </div>
                                    <span className={`line ${index === listPlaceholder.length - 1 ? "noMobile" : ""}`}></span>
                                </Fragment>
                            );
                        else
                            return (
                                <Fragment>
                                    <div className="prod-item prod-item--empty">
                                        <div className="msg-empty">
                                            {/* <span className="icon"></span> */}
                                            <p>Añade otro vehículo</p>
                                        </div>
                                    </div>
                                    <span className={`line ${index === listPlaceholder.length - 1 ? "noMobile" : ""}`}></span>
                                </Fragment>
                            );
                    })}

                    <div className="prod-actions">
                        <div className="buttons">
                            <div className={`btn bc-btn-primary ${productList.length > 1 ? "" : "bc-select--disabled"}`} onClick={this.handleToggleComparator}>
                                COMPARAR
                            </div>                            
                            <div className="btn-delete-products" onClick={() => ComparatorServices.cleanList()}>
                                {window.screen.width < this.breakPoint ? "Borrar selección" : "Borrar todos"}
                                <i class="fenix-icon-remove"></i>
                            </div>
                        </div>
                    </div>
                </div>
            );
        else return;
    }
}

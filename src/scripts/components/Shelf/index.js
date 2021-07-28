import { h, Component, createRef } from "preact";
import fetch from "unfetch";
import { _formatMoney } from "../../global/helpers";
import { UserServices } from "../../global/user";
import shelfFunctions from "../../base/shelf";
import { SC_MIDDLE_API } from "../../global/constants";

export default class Shelf extends Component {
    constructor(props) {
        super(props);
        this.state = { productList: [] };
    }

    componentDidMount() {
        const user = UserServices.getUserData();
        if (user && user.userEmail) {
            fetch(`${SC_MIDDLE_API.recoments}?email=${user.userEmail}`, {
                headers: { "Content-Type": "application/json", authorization: `Bearer ${user.userToken}` },
            })
                .then((res) => {
                    if (!res.ok) {
                        $(".js-shelf").hide();
                        return false;
                    } else return res.json();
                })
                .then((productList) => {
                    if (productList && productList.length) {
                        $(".js-default-shelf").hide();
                        this.setState({ productList }, () => {
                            shelfFunctions.init({ slickShelf: true });
                        });
                    }
                });
        } else {
            $(".js-shelf").hide();
        }
    }

    componentDidCatch(err) {
        console.log(err);
    }

    getFieldValue = (product, property) => {
        const field = product.productSpecifications.filter((p) => p.fieldName === property);
        if (field.length && field[0].fieldValues.length) return field[0].fieldValues[0];
        return "";
    };

    render(_, { productList }) {
        const user = UserServices.getUserData();
        return user && user.userEmail && productList.length ? (
            <div className="bc-shelf-container container">
                
                <h4 className="bc-shelf-container__title m-bottom-2 hidden-lg">
                    Te recomendamos estos carros<span className="bc-shelf-container__counter"></span>
                </h4>
                <div className="bc-shelf-container__wrap row">
                    <div className="bc-shelf-container__title visible-lg">
                        <h4>Te recomendamos estos carros</h4>
                        <a href="/recomendados" class="bc-btn-primary">IR A RECOMENDADOS</a>
                    </div>
                    <div class="bc-shelf-container__items">
                        <ul>
                            {productList.map((prod) => (
                                <div
                                    className={`bc-shelf-item product-${prod.productId}`}
                                    data-productId={prod.productId}
                                    data-category={prod.productCategoryIds.split("/")[1]}
                                >
                                    {/* {JSON.stringify(prod)} */}
                                    <div className="bc-shelf-item__top" href={prod.detailUrl}>
                                        <a href={prod.detailUrl} className="bc-shelf-item__img">
                                            <img className="img-responsive" src={prod.images[0].imageUrl}
                                                 alt={prod.productName} />
                                        </a>
                                        <div class="d-flex flex-sb flex-acenter">
                                            <a href={prod.detailUrl} className="bc-shelf-item__satus">
                                                {this.getFieldValue(prod, "Condición")}
                                            </a>
                                            <i className="fenix-icon-heart js-add-to-wl"></i>
                                        </div>
                                    </div>

                                    <a className="bc-shelf-item__body" href={prod.detailUrl}>
                                        <div className="namehover hint--bottom hint--rounded"
                                             aria-label={prod.productName}>
                                            <div className="bc-shelf-item__name">{prod.productName}</div>
                                        </div>
                                        <div className="bc-shelf-item__specs d-flex">
                                            <div>{this.getFieldValue(prod, "Modelo")}</div>
                                            <div className="numbertoFormat">{this.getFieldValue(prod, "KM")} Km</div>
                                            <div className="last">{this.getFieldValue(prod, "Municipio")}</div>
                                        </div>
                                        <div className="bc-shelf-item__price">{_formatMoney(prod.basePrice)}</div>
                                    </a>

                                    <div className="bc-shelf-item__foot">
                                        <button className="bc-btn-icon-ghost js-compare">
                                            {/* <i className="icon-exchange"></i> */}
                                            Comparar
                                        </button>
                                        <a className="bc-btn-ghost" href={prod.detailUrl}>
                                            Conocer más
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ) : (
            <div></div>
        );
    }
}

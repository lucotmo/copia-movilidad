import { h, Component, createRef } from "preact";
import fetch from "unfetch";
import { _formatMoney } from "../../global/helpers";
import { SC_API_URL, MK_ID } from "../../global/constants";

require("jquery-mousewheel")($);
require("malihu-custom-scrollbar-plugin")($);

export default class SearchBar extends Component {
    inputRef = createRef();

    constructor(props) {
        super(props);
        this.state = { isActive: window.screen.width < 1024, resultEmpty: false, isProductListVisible: false, productList: [], isSellerListVisible: false, sellerList: [] };
    }

    openSearchInput = (e) => {
        const searchInput = this.inputRef.current;

        if (searchInput.value || window.screen.width < 1024) {
            searchInput.value = "";
            this.setState({resultEmpty: false, isProductListVisible: false, productList: [], isSellerListVisible: false, sellerList: [] });
        } else this.setState((prevState) => ({ isActive: !prevState.isActive }));

        e.preventDefault();
    };

    handleChangeSearchInput = async (ev) => {
        const { value } = ev.target;
        let inputSearch = document.querySelector('.search-bar__input').value;
        if (value && value.length > 2 || inputSearch.length > 2) {
            if (ev.key == "Enter" || ev.target.classList.contains("search-bar__btn")) window.location.href = "/" + this.inputRef.current.value.toLowerCase();
            const dataSellers = await fetch(`${SC_API_URL}/seller/api/v1/search/${value}?marketplaceId=${MK_ID}`)
              .then((res) => res.json())
              .catch((err) => console.error(err));

            const dataProducts = await fetch(`/api/catalog_system/pub/products/search/${value}`)
              .then((res) => res.json())
              .then((productList) => {
                  productList.forEach(element => {
                      let nStr = element.productName .search("-");
                      let newName = element.productName .slice(nStr + 1);
                      element.productName = newName;
                  });
                  return productList;
                }
              )
              .catch((err) => console.error(err));

            if (dataSellers.length === 0 && dataProducts.length === 0)  {
                this.setState({resultEmpty: true, isProductListVisible: false, productList: [], isSellerListVisible: false, sellerList: [] })
            } else {
                this.setState({ 
                    resultEmpty: false,
                    isProductListVisible: dataProducts?.length > 0 ? true : false,
                    productList: dataProducts?.length > 0 ? dataProducts : [],
                    isSellerListVisible: dataSellers?.length > 0 ? true : false,
                    sellerList: dataSellers?.length > 0 ? dataSellers : [],
                });
            }
        } else {
            this.setState({resultEmpty: false, isProductListVisible: false, productList: [], isSellerListVisible: false, sellerList: [] });
        }
    };

    componentDidMount() {
        $(".search-bar__results").mCustomScrollbar();
    }

    componentDidUpdate() {
        if (this.state.isActive) this.inputRef.current.focus();
    }

    componentDidCatch(err) {
        console.log(err);
    }

    highlight = (productName) => {
        const lowerSearch = this.inputRef.current.value.toLowerCase();
        const lowerName = productName.toLowerCase();
        const index = lowerName.indexOf(lowerSearch);
        if (index >= 0) {
            return (
                <span>
                    {productName.substring(0, index)}
                    <span className="highlight">{productName.substring(index, index + lowerSearch.length)}</span>
                    {productName.substring(index + lowerSearch.length)}
                </span>
            );
        } else return productName;
    };

    render(_, { isActive, resultEmpty, isProductListVisible, productList, isSellerListVisible, sellerList }) {
        const isCleanBtn = window.screen.width < 1024 ? this.inputRef.current && this.inputRef.current.value !== "" : isActive;

        return (
            <div className={`search-bar__container${isActive ? " search-bar__container--active" : ""} ${(isProductListVisible || isSellerListVisible) && !resultEmpty ? " search-bar__container--active__listVisible" : ""}`}>
                <form action>
                    <input
                        type="search"
                        ref={this.inputRef}
                        className="search-bar__input"
                        onKeyUp={this.handleChangeSearchInput}
                        placeholder="Busca una marca, modelo o línea"
                    />
                </form>
                <p className="search-bar__text" onClick={this.openSearchInput}>Búsqueda rápida de vehículos</p>
                <button className={`${isActive ? "bc-btn search-bar__close" : "hidden"}`} onClick={this.openSearchInput}>
                    <i className={`${isActive ? "fenix-icon-error" : ""}`}></i>
                </button>
                <button className="bc-btn search-bar__btn fenix-icon-search" onClick={this.handleChangeSearchInput}></button>
                <div
                    className={`search-bar__results${((isProductListVisible || isSellerListVisible) || resultEmpty) && " search-bar__results--visible"}${
                      (resultEmpty) ? " results--empty" : ""
                        }`}
                >
                    {!(productList?.length === 0 && sellerList?.length === 0) ? (
                        <div className="search-bar__results--items">
                            {sellerList?.map((prod) => (
                                <a href={`store?fq=specificationFilter_91:${prod.id}`} className="search-bar__results--item">
                                    <img className="image" src={prod.image}></img>
                                    <div className="information">
                                        <span href={prod.link} className="name">Tienda</span>
                                        <span className="price">
                                            {this.highlight(`${prod.name}`)}
                                        </span>
                                    </div>
                                </a>
                            ))}
                            {productList?.map((prod) => (
                                <a href={prod.link} className="search-bar__results--item">
                                    <img className="image" src={prod.items[0].images[0].imageUrl}></img>
                                    <div className="information">
                                        <span href={prod.link} className="name">
                                            {this.highlight(`${prod.productName} ${prod.Modelo || ""}`)}
                                        </span>
                                        <span className="price">{_formatMoney(prod.items[0].sellers[0].commertialOffer.Price)}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : resultEmpty ? (
                      <div className="search-bar__results--empty">
                        <h5 className="title">No encontramos resultados para tu búsqueda.</h5>
                        <p className="text">Intenta usando otras palabras o amplía tu búsqueda.</p>
                      </div>
                    ) : null}
                </div>
                {!(productList?.length === 0 && sellerList?.length === 0) ? (
                    <div className="search-bar__results--more">
                        <a href={"/" + this.inputRef.current.value.toLowerCase()}>
                            <span>Mostrar todos los resultados</span>
                            <i className="fenix-icon-search"></i>
                        </a>
                    </div>
                ) : null }
            </div>
        );
    }
}

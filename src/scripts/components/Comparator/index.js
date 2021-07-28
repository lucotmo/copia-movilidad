import fetch from "unfetch";
import { h, Component, Fragment, createRef } from "preact";

import "../../vendor/hammer";
import { LS_COMPARATOR } from "../../global/constants";
import ComparatorServices from "../../base/comparator";


/*===== Funcionalidad para activar dislizador de la primera vista del comparador en mobile =====*/
const firstSlideComparator = () => {
  var widthWindow = $(window).width();

  if (widthWindow < 1024) {    
    var heightWindow = $(window).height();
    $('.js-compare-list').css("top", `calc(100% - 309px)`);

    var myElement = document.querySelector('.swipeComparator');
    const slideComparator = new Hammer(myElement);
    slideComparator.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL, threshold: 1, velocity: 0.1 });

    slideComparator.on("panmove", function (ev) {
      $('.js-compare-list').css("top", `calc(100% - 309px + ${ev.deltaY}px`);
    });

    slideComparator.on("panend", function (ev) {
      if (ev.deltaY < 200 && ev.deltaY > -200) {
        $('.js-compare-list').css("top", `calc(100% - 309px)`);
      }
      else if (ev.deltaY < -200) {
        setTimeout(() => {
          $('.js-compare-list').css("top", `100%`);
          $('.prod-actions .bc-btn-primary').click();
        }, 100);
      }
      else {
        ComparatorServices.cleanList();
      }
    });
  }
};

$(() => {
  setTimeout(() => {
    if ($('.prods').length) {
      firstSlideComparator();
    }
  }, 100);
  
  $('.bc-btn-icon-ghost.js-compare').on('click', () => {
    setTimeout(() => {
      firstSlideComparator();
    }, 100);
  });
});
/*====================================================================================================*/

export default class Comparator extends Component {
    breakpoint = 1024;
    swipeSelectorRef = createRef();
    containerSelectorRef = createRef();
    productList = ComparatorServices.getProductList() || [];
    category = ComparatorServices.getCategory();
    additionalSpecs = [
      { name: "Aire acondicionado", vtexName: "Aire acondicionado" },
      { name: "Alarma", vtexName: "Alarma" },
      { name: "Vidrios Eléctricos", vtexName: "Vidrios eléctricos" },
      { name: "Frenos ABS", vtexName: "ABS" },
    ];

    constructor(props) {
      super(props);

      const listPlaceholder = [];
      const listLength = window.screen.width < this.breakpoint ? LS_COMPARATOR.maxItemsMobile : LS_COMPARATOR.maxItemsDesktop;
      for (let i = 0; i < listLength; i++) listPlaceholder.push(i);

      this.state = { listPlaceholder, specsList: [] };
    }

    handleRemoveProduct = (productId) => {
      ComparatorServices.removeProduct(productId);
      this.productList = this.productList.filter((prod) => prod.id !== productId);
      this.setState((prevState) => ({ specsList: prevState.specsList.filter((prod) => prod.productId !== `${productId}`) }));
        
        if (this.state.specsList.length === 1 || this.state.specsList.length === 2) {
            // window.location.href = this.category
            window.history.back();
        }
    };

    componentDidMount() {
      // console.log('produclist', this.productList);
      if (this.productList.length) {
        let specsURL = "/api/catalog_system/pub/products/search?";
        this.productList.forEach((prod, i) => (specsURL += `${i > 0 ? "&fq=" : "fq="}productId:${prod.id}`));

        fetch(specsURL)
          .then((res) => res.json())
          .then((data) => {
            const specsList = [];
            this.productList.forEach((prod) => {
              let found = false;
              data = data.filter((dataProd) => {
                if (!found && dataProd.productId == prod.id) {
                  specsList.push(dataProd);
                  found = true;
                  return false;
                } else return true;
              });
            });
            this.setState({ specsList });
          });
      }

      if (this.swipeSelectorRef.current && this.containerSelectorRef.current) {
        const $container = $(this.containerSelectorRef.current);
        const defaultTop = window.screen.height * 0.18;

        const swipeMobile = new Hammer(this.swipeSelectorRef.current);
        const { onClose } = this.props;

        swipeMobile.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL, threshold: 1, velocity: 0.1 });

        swipeMobile.on("panmove", function (ev) {
          $container.css("top", `${defaultTop + ev.deltaY}px`);
        });

        swipeMobile.on("panend", function (ev) {
          if (ev.deltaY < 200) $container.css("top", `${defaultTop}px`);
          else {
            onClose();

            // Cerrar comparador mobile, al deslizar hacia abajo
            $('.js-compare-list').css("top", `100%`);
            setTimeout(() => {
              firstSlideComparator();
            }, 100);
          }
        });
      }
    }

    render(_, state) {
      const { listPlaceholder, specsList } = state;
      return (
        <div className="content-comparator container" ref={this.containerSelectorRef}>
          <div className="swipeMobile" ref={this.swipeSelectorRef}>
            <a className="return-page-swipe" href="#"></a>
          </div>
          <a className="link-return-page" href={this.category}>
            <div className="fenix-icon-arrow2-left"></div>
            <p className="return-link">Volver a buscar</p>
          </a>

          <div className="content-products-comparator">
            {listPlaceholder.map((index) => {
              const product = this.productList[index];
              const productSpecs = specsList[index];
              const isLastItem = index === listPlaceholder.length - 1;
              return (
                <Fragment>
                  <div className="product-column">
                    <div className={`header-comparator${isLastItem ? " mobileSettings" : ""}`}>
                      <div className="product-img">
                        {product && product.image ? (
                          <img src={product.image} alt="Product main image" />
                        ) : (
                          <div className="product-no-img-content">
                            <img src="/arquivos/img-no-comparador.jpg" alt="No product" />
                            <a className="link-return-img" href={this.category}>
                                Agregar producto a comparar
                            </a>
                          </div>
                        )}
                      </div>

                      {product && (
                        <div className="product-link-delete" onClick={() => this.handleRemoveProduct(product.id)}>
                          <p>Eliminar</p>
                          <span className="icon"></span>
                        </div>
                      )}
                      <div className="product-info-select">
                        <div className="product-content-specs">
                          <div className="product-status">
                            <p>{product ? product.status : ""}</p>
                          </div>
                          <div className="product-brand-name">
                            <p>{productSpecs ? productSpecs["Marca"] || "-" : ""}</p>
                          </div>
                          <div className="product-specs">
                            <div>{productSpecs ? productSpecs["Línea"] || "-" : ""}</div>
                            <div>{productSpecs ? productSpecs["Versión"] || "-" : ""}</div>
                          </div>
                        </div>
                        <div className="product-brand-logo">
                          {productSpecs && productSpecs["Marca"] && (
                          <img src={`/arquivos/${(productSpecs["Marca"])}.png`} alt="Product Brand" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`content-specs-table${isLastItem ? " mobileSettings" : ""}`}>
                      <div className="specs-labels-table">
                        <div className="specs-product-labels">
                          {product && (
                            <Fragment>
                              <div className="specs-label">Precio</div>
                              <div className="specs-product">{product.price || ""}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {productSpecs && (
                            <Fragment>
                              <div className="specs-label">Modelo</div>
                              <div className="specs-product">{productSpecs["Modelo"] || "-"}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {product && (
                            <Fragment>
                              <div className="specs-label">Kilometraje</div>
                              <div className="specs-product">{product.km ? `${product.km} Km` : "-"}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {productSpecs && (
                            <Fragment>
                              <div className="specs-label">Motor</div>
                              <div className="specs-product">{productSpecs["Cilindraje (motor)"] || "-"}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {productSpecs && (
                            <Fragment>
                              <div className="specs-label">Ubicación</div>
                              <div className="specs-product">{productSpecs["Departamento"] || "-"}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {productSpecs && (
                            <Fragment>
                              <div className="specs-label">Transmisión</div>
                              <div className="specs-product">{productSpecs["Transmisión"] || "-"}</div>
                            </Fragment>
                          )}
                        </div>
                        <div className="specs-product-labels">
                          {productSpecs && (
                            <Fragment>
                              <div className="specs-label">Combustible</div>
                              <div className="specs-product">{productSpecs["Combustible"] || "-"}</div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                      <div className="specs-equipment-table">
                        {this.additionalSpecs.map((spec) => {
                          if (productSpecs) {
                            // console.log('productSpecs', productSpecs);
                            // console.log('spec', spec);
                            // console.log('hey', productSpecs[spec.vtexName][0] === "SI");
                            return (
                              <div className="specs-equipment-status">
                                <p>{spec.name}</p>
                                <div
                                  className={
                                    productSpecs[spec.vtexName] &&
                                    productSpecs[spec.vtexName][0] === "SI"
                                      ? "checked"
                                      : "none"
                                  }
                                ></div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="specs-equipment-status">
                                <p></p>
                                <div></div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                    {product && (
                      <div class="product-link-delete-mobile" onClick={() => this.handleRemoveProduct(product.id)}>
                        <p>Eliminar</p>
                        <span class="icon"></span>
                      </div>
                    )}
                    {productSpecs && (
                      <div className="product-page-btn">
                        <button
                          className="bc-btn-secundary-white product-page-comparator"
                          onClick={() => (window.location.href = productSpecs.link)}
                        >
                          Ir a detalle
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={`line${isLastItem ? " last" : ""}`}></span>
                </Fragment>
              );
            })}
          </div>
        </div>
      );
    }
}

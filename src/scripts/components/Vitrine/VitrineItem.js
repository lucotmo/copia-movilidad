import { h, Component, Fragment } from 'preact'; // NOSONAR
import VitrineImages from './VitrineImages';

export default class VitrineItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: this.props.product
    };
  }

  clickTooltip(vehiculo) {
    localStorage.setItem("imbSlect", vehiculo)
    $('.bc-shelf-item').removeClass('add-map')
    $('.map-price-marker').removeClass('add-map')
    $('.product-' + vehiculo).addClass('add-map')
    $('.map-price-marker-' + vehiculo).addClass('add-map')

    var slideno = $('.Carrusel-Vehiculos').find('.product-carrusel-' + vehiculo).data('slide');
    $('.Carrusel-Vehiculos').slick('slickGoTo', slideno);
    setTimeout(() => {
      $('.brother').removeClass('add-map')
      $('.brother-price-marker-' + vehiculo).addClass('add-map')
    }, 150);
  }

  renderSpecs(producto, spec) {
    if (!!producto.productSpecifications && producto.productSpecifications.length > 0) {
      const specification =`${producto.productSpecifications.find(speci => speci.fieldName === spec).fieldValues}`; 
      return specification;
    } else if (producto[spec] && producto[spec].length > 0) {
      return `${producto[spec][0]}`;
    }
  }

  render() {
    let producto = this.state.product;
    var precio = producto.basePrice || producto.items[0].sellers[0].commertialOffer.Price + "" || producto.price
    var toNumber = ""
    let barrio = null;
    let municipio = null;
    let departamento = null;
    // Agregado para validar s la url tiene /p incluido
    let linkProduct = producto.link ? (
      producto.link.substr(-2) === '/p' ? linkProduct = producto.link : linkProduct = producto.link + '/p'
    ) : linkProduct = producto.link;
    // Agregado para validar s la url tiene /p incluido
    let linkUrlDetail = producto.detailUrl ? (
      producto.detailUrl.substr(-2) === '/p' ? linkUrlDetail = producto.detailUrl : linkUrlDetail = producto.detailUrl + '/p'
    ) : linkUrlDetail = producto.detailUrl;

    let nStr = producto.productName.search("-")
    let newName = producto.productName.slice(nStr + 1)
    producto.productName = newName;
    if (producto.Barrio && producto.Barrio[0] !== null) {
      barrio = producto.Barrio;
    } else if (producto.productSpecifications) {
      producto.productSpecifications.forEach(specifications => {
        if (specifications.fieldName === 'Barrio') {
          barrio = specifications.fieldValues[0]
        }
      });
    }
    if (producto.Municipio && producto.Municipio[0] !== null) {
      municipio = producto.Municipio;
    } else if (producto.productSpecifications) {
      producto.productSpecifications.forEach(specifications => {
        if (specifications.fieldName === 'Municipio') {
          municipio = specifications.fieldValues[0]
        }
      });
    }
    if (producto.Departamento && producto.Departamento[0] !== null) {
      departamento = producto.Departamento;
    } else if (producto.productSpecifications) {
      producto.productSpecifications.forEach(specifications => {
        if (specifications.fieldName === 'Departamento') {
          departamento = specifications.fieldValues[0]
        }
      });
    }
    if (precio.toString().includes(".")) {
      toNumber = "$" + (precio.split('.')[0]).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
    } else {
      toNumber = "$" + precio.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")
    }
    const name = (`${barrio && barrio[0] !== '' ? barrio + ',' : ''} ${municipio ? municipio + ',' : ''} ${departamento}`);
    const nameCapitalized = name;
    var Complete = true;
    var tag = false

    return (
      <Fragment>
        {
          Complete ?
            <div className={"bc-shelf-item product-" + producto.productId} data-productId={producto.productId} data-category={producto.categoryId} id={"bc-shelf-item-" + producto.productId} onclick={() => { this.clickTooltip(producto.productId) }}>
              <div className="bc-shelf-item__top" href={linkProduct ? linkProduct : linkUrlDetail}>
                <div className="bc-shelf-item__img">
                  {tag && <div className="type-special">
                    <img src="/arquivos/monto-minimo.svg" />
                                     Feria de Movilidad
                  </div>}
                  {producto.items[0]['images'] &&
                    <VitrineImages
                      images={producto.items[0]['images']} id={producto.productId} />
                  }
                </div>
                <div className="d-flex flex-sb flex-acenter">
                  <div className="bc-shelf-item__satus">
                    {this.renderSpecs(producto, "Condición")}
                  </div>
                  <i className="fenix-icon-heart js-add-to-wl"></i>
                </div>
              </div>
              <a className="bc-shelf-item__body" href={linkProduct ? linkProduct : linkUrlDetail}>
                <div className="namehover hint--bottom hint--rounded" aria-label={producto.productName}>
                  <div className="bc-shelf-item__name" >{producto.productName}</div>
                </div>
                <div className="bc-shelf-item__specs d-flex">
                  <div className="Modelo">
                    {this.renderSpecs(producto, "Modelo")}
                  </div>
                  <div className="numbertoFormat">
                    {this.renderSpecs(producto, "KM")} Km
                  </div>
                  <div className="last bads">
                    {this.renderSpecs(producto, "Municipio")}
                  </div>
                </div>
                <div className="bc-shelf-item__price">{toNumber}</div>
              </a>
              <div className="bc-shelf-item__foot">
                <button className="bc-btn-icon-ghost js-compare" >{/* <i className="icon-exchange"></i> */}Comparar</button>
                <a className="bc-btn-ghost" href={linkProduct ? linkProduct : linkUrlDetail} >Conocer más</a>
              </div>
            </div>
            : <div>Incompleto</div>}
      </Fragment>

    );
  }
}

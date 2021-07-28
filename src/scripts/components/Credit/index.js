import { h, Component, createRef } from "preact";

import BCSecondarySlider from "../Slider/SecondarySlider";
import { showToastifyMessage, _formatMoney } from "../../global/helpers";
import { UserServices } from "../../global/user";
import { CREDIT_URL, SC_MIDDLE_URL } from "../../global/constants";

export default class BCCredit extends Component {
    feeSelectRef = createRef();
    price = 0;
    rate = 1.05;
    convertRate = this.rate / 100 + 1;
    rateAnnual = ((Math.pow(this.convertRate, 12) - 1) * 100).toFixed(2);
    valueMin = 10000000;

    // state.shareSimulator = 36;
    valueVehCredit = 0;
    shareInitValue = 0;
    valueShareMonthMin;
    valueMonthMin = 0;
    valueShareMonthMax = 0;
    valueToFinance;
    shareMonthValue = 0;
    // lifeInsurance = 0;

    constructor(props) {
      super(props);
      if (typeof props.product === "undefined") props.product = require("./api.json");

      this.state = { shareSimulator: 36, moreInfo: false, lifeInsurance: 0 };
      this.price = props.product.items[0].sellers[0].commertialOffer.ListPrice;
    }

    componentDidMount() {
      fetch("https://external.apps.bancolombia.com/movilidad/core/productos-financieros/api/v1/credit-simulation", {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.rate = data.data.value;
          this.changeValueCar("firstTime");
        })
        .catch((json) => {
          console.log("Error consultando la tasa y se deja por default de 1.05", json);
          this.changeValueCar("firstTime");
        });
    }

    collapse = (e) => {
      $(this.feeSelectRef.current).removeClass("bc-select--active");
      e.preventDefault();
    };

    onSelectFee = (e) => {
      const monthSelected = selectBox.options[selectBox.selectedIndex].value;
      $(this.feeSelectRef.current).removeClass("bc-select--active");
      this.setState({ shareSimulator: monthSelected });
      this.changeMonths();
      e.preventDefault();
    };

    // Se activa cuando modifican la cuota incial de credito
    changeShareInitial(sliderName, value) {
      if (value > 0) {
        this.shareInitValue = value;
        this.calculateByInitial();
        this.getLifeInsurance();
      } else {
        this.shareInitValue = 0;
        this.calculateByInitial();
        this.getLifeInsurance();
      }
    }

    // Se activa cuando modifican la cuota mensual
    changeMonthShare = (sliderName, value) => {
      this.setState((state, props) => {
        this.shareMonthValue = 0;
        var valueTotalFinance = 0;
        this.shareInitValue = 0;
        this.valueToFinance = 0;
        this.shareMonthValue = value;
        valueTotalFinance =
                (((1 + this.rate / 100) ** state.shareSimulator - 1) * Math.ceil(this.shareMonthValue)) /
                ((1 + this.rate / 100) ** Math.ceil(state.shareSimulator) * (this.rate / 100));

        this.shareInitValue = Math.ceil(this.valueVehCredit - valueTotalFinance);
        this.valueToFinance = this.valueVehCredit - this.shareInitValue;
        this.getLifeInsurance();
      });
    };

    //Obtiene el total del seguro de vida
    getLifeInsurance() {
      this.setState({ lifeInsurance: (this.valueToFinance / 1000000) * 1200 });
    }

    // Calcula la cuota mensual a partir de los meses y la cuota inicial
    calculateByInitial() {
      this.valueToFinance = this.valueVehCredit - this.shareInitValue;
      this.valueShareMonthMin = this.getShareMonthMin();
      this.shareMonthValue = this.getShareMonthMin();
    }

    componentDidCatch(err) {
      console.log(err);
    }

    moreInfoFunction = (e) => {
      this.setState({ moreInfo: !this.state.moreInfo });
    };

    // Actualiza el valor del carro cuando se cambia el valor de credito
    changeValueCar = (event) => {
      if (event === "firstTime") {
        let carValue = this.price;
        this.valueVehCredit = this.price;
        this.shareInitValue = 0;
        this.valueToFinance = this.valueVehCredit - this.shareInitValue;
        this.getLifeInsurance();
        //Actualizar cuota minima y maxima
        this.valueShareMonthMin = this.getShareMonthMin();
        this.valueShareMonthMax = this.getShareMonthMax();
        this.shareMonthValue = this.getShareMonthMin();
      } else {
        let carValue = event.target.value;
        this.valueVehCredit = Number(carValue.replace(/[$.]/g, ""));
        this.shareInitValue = 0;
        this.valueToFinance = this.valueVehCredit - this.shareInitValue;
        this.getLifeInsurance();
        //Actualizar cuota minima y maxima
        this.valueShareMonthMin = this.getShareMonthMin();
        this.valueShareMonthMax = this.getShareMonthMax();
        this.shareMonthValue = this.getShareMonthMin();
      }
    };

    // Actualiza la cuota mensual cuando se cambia el plazo credito
    changeMonths() {
      if (this.valueVehCredit > 0) {
        this.setState((state, props) => {
          const convertRate = this.rate / 100;
          const resultPow = Math.pow(convertRate + 1, state.shareSimulator);
          this.valueMonthMin = Math.ceil((this.valueMin * resultPow * convertRate) / (resultPow - 1));
          this.valueShareMonthMin = Math.ceil((this.valueToFinance * resultPow * convertRate) / (resultPow - 1));
          this.valueShareMonthMax = Math.ceil((this.valueVehCredit * resultPow * convertRate) / (resultPow - 1));

          this.shareMonthValue = this.valueShareMonthMin;
        });
      }
    }

    // Obtiene la cuota maxima
    getShareMonthMax() {
      // this.setState((state, props) => {
      const convertRate = this.rate / 100;
      const resultPow = Math.pow(convertRate + 1, this.state.shareSimulator);
      return Math.ceil((this.valueVehCredit * resultPow * convertRate) / (resultPow - 1));
      // });
    }
    // Obtiene la cuota minima
    getShareMonthMin() {
      // this.setState((state, props) => {
      const convertRate = this.rate / 100;
      const resultPow = Math.pow(convertRate + 1, this.state.shareSimulator);
      this.valueMonthMin = Math.ceil((this.valueMin * resultPow * convertRate) / (resultPow - 1));
      return Math.ceil((this.valueToFinance * resultPow * convertRate) / (resultPow - 1));
      // });
    }

    onRedirectCredit = async () => {
      if (this.valueVehCredit < 10000000) {
        showToastifyMessage({message: "El prestamo minimo es de $10.000.000", blockRepeat: true, type: "alert"});
      } else {
        const { product } = this.props; 
        const productJsonB64 = Buffer.from(
          JSON.stringify({
            vehicleCredit: {
              state: product["Condición"] ? product["Condición"][0].toUpperCase() : "",
              type: product["Categoría / Tipo de vehículo"] ? product["Categoría / Tipo de vehículo"][0] : "" ,
              brand: product.brand ? product.brand.toUpperCase(): "",
              line: product["Línea"] && product["Línea"].length ? product["Línea"][0] : "",
              name: product.items[0] ? product.items[0].name : "",
              characteristics: {
                year: /^\d+$/.test(product["Modelo"][0]) ? product["Modelo"][0] : "2020",
                km: product["KM"] ? product["KM"][0] : "",
                city: product["Municipio"] ? product["Municipio"][0] : "",
              },
              image: product.items[0].images[0] ? product.items[0].images[0].imageUrl : "",
              price: product.items[0].sellers[0] ? product.items[0].sellers[0].commertialOffer.Price : "" ,
              distributor: product.seller.sellerName ? product.seller.sellerName : "" ,
              distributorId: product.items[0].sellers[0] ? product.items[0].sellers[0].sellerId : "",
              typeOfRequest: `CREDITO_VEHICULO_${product["Condición"][0].toUpperCase()}`,
              initialFee: this.shareInitValue,
            },
          })
        ).toString("base64");

        let jws = "";
        // (BO-157) Se comenta el codigo de las lineas (205-212) Para evitar el envio del jwt a la pagina de tu360
        // const user = UserServices.getUserData();

        // if (user && user.isUserDefined)
        //     jws = await fetch(`${SC_MIDDLE_URL}/login/create-delegation-token?email=${user.userEmail}`, {
        //         headers: { "Content-Type": "application/json", authorization: `Bearer ${user.userToken}` },
        //     })
        //         .then((res) => (res.ok ? res.json() : null))
        //         .then((res) => (res ? res.token : ""));

        window.open(`${CREDIT_URL}/sso?section=credito&vehicleData=${productJsonB64}&jws=${jws}`);
      }
    };

    render(_, state) {
      const { shareSimulator, moreInfo, lifeInsurance } = state;

      return (
        <div class="productSection__solicitudDeFinanciacion__content__options__Credito ">
          <div class="CreditoForm finance-simulador ">
            <div class="bc-select__wrapper label-pay">
              {/* <div class="qouta-leasing-simulator-container-credit"> */}

              <div class="credit-content-input">
                <div>
                  <label class="label-title-simulador">PAGAR EL CRÉDITO A</label>
                  <div
                    class="bc-select__input result-title-simulator"
                    onClick={(e) => {
                      $(this.feeSelectRef.current).toggleClass("bc-select--active");
                      e.preventDefault();
                    }}
                  >
                    <select
                      onChange={this.onSelectFee}
                      id="selectBox"
                      class="bc-select__input result-title-simulator-select"
                    >
                      <option class="bc-select__option col-12" value={12}>
                        {12} Meses ({12 / 12} {12 / 12 > 1 ? "Años" : "Año"})
                      </option>
                      <option class="bc-select__option col-12" value={24}>
                        {24} Meses ({24 / 12} {24 / 12 > 1 ? "Años" : "Año"})
                      </option>
                      <option class="bc-select__option col-12" value={36} selected>
                        {36} Meses ({36 / 12} {36 / 12 > 1 ? "Años" : "Año"})
                      </option>
                      <option class="bc-select__option col-12" value={48}>
                        {48} Meses ({48 / 12} {48 / 12 > 1 ? "Años" : "Año"})
                      </option>
                      <option class="bc-select__option col-12" value={60}>
                        {60} Meses ({60 / 12} {60 / 12 > 1 ? "Años" : "Año"})
                      </option>
                      <option class="bc-select__option col-12" value={72}>
                        {72} Meses ({72 / 12} {72 / 12 > 1 ? "Años" : "Año"})
                      </option>
                    </select>
                    <i class="fenix-icon-arrow2-down"></i>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

            <div class="qouta-credit-simulator-container ">
              <BCSecondarySlider
                label="CUOTA MENSUAL"
                limits={[this.valueMonthMin, this.valueShareMonthMax]}
                value={this.shareMonthValue}
                step={50000}
                onChange={(value) => this.changeMonthShare("monthlyFee", value)}
              />
            </div>
            <div class="qouta-init-credit-simulator-container">
              <BCSecondarySlider
                label="CUOTA INICIAL"
                limits={[0, this.valueVehCredit - this.valueMin]}
                value={this.shareInitValue}
                step={50000}
                onChange={(value) => this.changeShareInitial("initialFee", value)}
              />
            </div>

            {!moreInfo && (
              <div class="footer-form-simulator">
                <p>
                                Esta información es suministrada en atención a la solicitud que has efectuado a Bancolombia S.A., la
                                misma se entrega sólo para fines informativos y no comporta oferta, opción o promesa de contratar a
                                cargo de Bancolombia S.A.
                  <br></br>
                  <a class="footer-form-simulator1" onClick={this.moreInfoFunction}>
                                    Más información
                  </a>
                </p>
              </div>
            )}
            {moreInfo && (
              <div class="footer-form-simulator">
                <p>
                                Esta información es suministrada en atención a la solicitud que has efectuado a Bancolombia S.A., la
                                misma se entrega sólo para fines informativos y no comporta oferta, opción o promesa de contratar a
                                cargo de Bancolombia S.A. Los términos de esta simulación son suministrados con base en las condiciones
                                comerciales y de mercado que han sido establecidas para la fecha en que se realiza. La cuota indicada
                                está compuesta por seguro de vida, intereses y capital. La cuota es fija, la tasa es variable y por lo
                                tanto el plazo estimado. La cuota no incluye seguro del vehículo. Recuerda que para esta simulación se
                                utilizó una tasa representativa desde  {this.rate}% nominal mes vencido, equivalente a {this.rateAnnual}% efectivo anual.
                  <br></br>
                  <a class="footer-form-simulator1" onClick={this.moreInfoFunction}>
                                    Menos información
                  </a>
                </p>
              </div>
            )}
          </div>
          <div class="info">
            <div class="summary-finance-simulator">
              <div class="">
                <div class="info__Sufi__contentPrice">
                  <div class="header-finance-container">
                    <div class="title-finance-container">
                      <div class="container-title-summary-simulator">
                        <span class="title-summary-simulator">PLAN TRADICIONAL</span>
                        <i class="fenix-icon-info"></i>
                      </div>
                      <div class="logo-sufi-simulador">
                        <p class="sufi-title">Ofrecido por:</p>
                        <img class="logo-sufi-summary-simulator" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTciIGhlaWdodD0iMzUiIHZpZXdCb3g9IjAgMCA1NyAzNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUyLjU3MzMgMi42NTM1N0M1MS45MjUzIDEuMDAwMTkgNTEuMDYxMyAtMC4xNjU0MzUgNDguNTE3MiAwLjIxNDg0MUM0My4yMzcxIDEuMDQxNTMgMzguMjg1IDEuOTY3NDIgMzAuNTU2OCAzLjUyMTU5QzI2LjY5MjcgNC4yNzM4NyAyMi42NTI2IDUuMTMzNjIgMTguMDYwNSA2LjE1ODcxQzEzLjQ2ODQgNy4xODM4IDguNzE2MjggOC4yNjY3NiAzLjQwNDE1IDkuNjU1NkMyLjQ1NjU4IDkuODYwMjMgMS42MjY1NiAxMC40NDU2IDEuMDk2ODggMTEuMjgyOUMwLjU2NzIwMiAxMi4xMjAyIDAuMzgxMjkgMTMuMTQwNyAwLjU4MDA4NSAxNC4xMTk3QzAuNjE4NjQ3IDE0LjI4ODcgMC42Njk0NTkgMTQuNDU0NSAwLjczMjA4OSAxNC42MTU3QzIuNTE2MTMgMTkuNzMyOSA0LjMwMDE3IDI1LjE5NzMgNS44MTIyMSAzMC44MTg4QzYuMzc3OTMgMzMuMDk0NyA4LjYxMjc4IDM0LjQ3NDQgMTAuODIwMyAzMy45MTA2TDExLjA1MjMgMzMuODQ0NEMyMS41MzI2IDMwLjE4MjIgMjkuOTQ4OCAyNy4yMzA5IDM3LjM0MSAyNC41NDQyQzM4Ljg1MyAyNC4wMTUxIDQwLjI1MyAyMy40OTQzIDQxLjYxMzEgMjIuOTk4M1YxMy42MjM3SDQwLjAxM1YxMC41NjQ5SDQxLjYxMzFWMTAuMDUyNEM0MS41NDA3IDguNDIyMDggNDIuMDYzMSA2LjgyMzA4IDQzLjA3NzEgNS41NzE3N0M0My45Mzk5IDQuNjc4NiA0NS4xMjAzIDQuMTkxMzQgNDYuMzQxMiA0LjIyNDI3QzQ2Ljk4NzYgNC4yMjM4NSA0Ny42MzEgNC4zMTU2NSA0OC4yNTMyIDQuNDk3MDhMNDguMTE3MiA3LjY5NjM1QzQ3LjcyNyA3LjU1NDg5IDQ3LjMxNDUgNy40OTAzOSA0Ni45MDEyIDcuNTA2MjFDNDUuNjkzMiA3LjUwNjIxIDQ1LjIwNTEgOC41NjQzNyA0NS4yMDUxIDkuODg3MDdWMTAuNTY0OUg0Ny41NDEyVjEzLjYyMzdINDUuMjQ1MVYyMS42NjczTDQ3LjI2MTIgMjAuOTQ4MUw0OS4yMDUyIDIwLjI3MDJWMTAuNzk2NEM1MC4zNTMxIDEwLjYzMjUgNTEuNTE1MyAxMC42MDQ4IDUyLjY2OTMgMTAuNzEzOFYxOC45ODA2TDU0LjUxNzQgMTguMjk0NUM1Ni41NDk0IDE3LjQ2NzggNTYuNzU3NCAxNS45MzAxIDU2LjMwMTQgMTQuMTYxQzU1LjE3MzQgMTAuMjAxMiA1My45NzMzIDYuNDMxNTIgNTIuNTczMyAyLjY1MzU3Wk0yMC42MTI2IDI0LjIzMDFDMTkuMjkzNyAyNC4yNzExIDE3Ljk4NzEgMjMuOTU3OCAxNi44MjA1IDIzLjMyMDdMMTcuNDYwNSAyMC4zMzY0QzE4LjQxMDggMjAuOTI2NyAxOS40ODg4IDIxLjI2MiAyMC41OTY2IDIxLjMxMTlDMjEuNzAwNiAyMS4zMTE5IDIyLjE1NjYgMjAuODkwMyAyMi4xNTY2IDIwLjIxMjRDMjIuMTU2NiAxOS41MzQ1IDIxLjc4MDYgMTkuMTc5IDIwLjQ0NDYgMTguNjQ5OUMxOC4wNDQ1IDE3LjczMjMgMTcuMDY4NSAxNi4yMjc4IDE3LjA5MjUgMTQuNjczNkMxNy4wOTI1IDEyLjE5MzUgMTguOTY0NSAxMC4yNTkxIDIxLjg5MjYgMTAuMjU5MUMyMy4wMzkzIDEwLjI1OTUgMjQuMTY5NCAxMC41NDI5IDI1LjE4ODcgMTEuMDg1OEwyNC42Mjg3IDEzLjg5NjVDMjMuODQ4IDEzLjQ0ODkgMjIuOTc2NiAxMy4xOTY5IDIyLjA4NDYgMTMuMTYwN0MyMS4xODg2IDEzLjE2MDcgMjAuNjkyNiAxMy41NjU4IDIwLjY5MjYgMTQuMjE4OUMyMC42OTI2IDE0Ljg3MiAyMS4xNTY2IDE1LjIxMDkgMjIuNTgwNiAxNS43ODEzQzI0LjgyMDcgMTYuNjA4IDI1LjcyNDcgMTcuOTQ3MyAyNS43ODA3IDE5LjkxNDhDMjUuNjc2NyAyMi40MDMxIDIzLjk4MDYgMjQuMjMwMSAyMC42MTI2IDI0LjIzMDFaTTM1LjUzMjkgMjMuOTMyNUwzNS4zNzI5IDIyLjA5NzJIMzUuMzAwOUMzNC41NjQyIDIzLjQ2OSAzMy4xNTQ4IDI0LjMwODUgMzEuNjM2OCAyNC4yNzk3QzI5LjIzNjggMjQuMjc5NyAyNy41MDg3IDIyLjYyNjMgMjcuNTA4NyAxOC40OTI5VjEwLjU2NDlIMzEuMTU2OFYxNy43NTcxQzMxLjE1NjggMTkuNjkxNiAzMS43MDA4IDIwLjg3MzcgMzIuOTk2OCAyMC44NzM3QzMzLjg0MyAyMC44NDI4IDM0LjU3NzggMjAuMjYyNiAzNC44Mjg5IDE5LjQyN0MzNC45MjcxIDE5LjEzNTEgMzQuOTcwNiAxOC44MjY0IDM0Ljk1NjkgMTguNTE3N1YxMC41NTY3SDM4LjYyMVYxOS42NTAyQzM4LjYyMSAyMS4zODYzIDM4LjY2OSAyMi44MDgyIDM4LjcwOSAyMy45MzI1SDM1LjUzMjlaTTUxLjA1MzMgOS4wNTIxMkM1MC4zMzg3IDkuMTAwODUgNDkuNjUzMyA4Ljc1MTk2IDQ5LjI1NTIgOC4xMzY4OUM0OC44NTcxIDcuNTIxODEgNDguODA2OCA2LjczMzk4IDQ5LjEyMzIgNi4wNzAxN0M0OS40Mzk2IDUuNDA2MzYgNTAuMDc0NyA0Ljk2NzQyIDUwLjc4OTMgNC45MTg2OEM1MC44NzcxIDQuOTEwNDIgNTAuOTY1NSA0LjkxMDQyIDUxLjA1MzMgNC45MTg2OEM1MS41ODA5IDQuOTA5ODUgNTIuMDkwMSA1LjExODU1IDUyLjQ2ODUgNS40OTg2M0M1Mi44NDY4IDUuODc4NzEgNTMuMDYzIDYuMzk4ODYgNTMuMDY5MyA2Ljk0NDA3QzUzLjA3MTUgNy40OTgwMSA1Mi44NiA4LjAzMDAyIDUyLjQ4MTcgOC40MjI0OUM1Mi4xMDM0IDguODE0OTcgNTEuNTg5NCA5LjAzNTU4IDUxLjA1MzMgOS4wMzU1OFY5LjA1MjEyWiIgZmlsbD0iI0ZBMEEzQyIvPgo8L3N2Zz4K" alt="Icono de Sufi" />
                      </div>
                    </div>
                    <div class="info__Sufi__contentPrice__containerInfo__price__responsive">
                      {_formatMoney(this.shareMonthValue + lifeInsurance)}/
                    </div>
                    <span class="value-share-summary-simulator">mes</span>
                    <div class="info__Sufi__contentPrice__containerInfo__logoSufi"></div>
                    <p class="label-share-summary-simulator p-simulator p-simulator">
                                        (Cuota: {_formatMoney(this.shareMonthValue)} + Seguro: {_formatMoney(lifeInsurance)})
                    </p>
                    <hr class="bar-summary" />

                    {/* <p class="label-asesor-simulator ">Pregúntale a tu asesor de SUFI por otros planes:</p>

                    <div class="types-share-summary-container">
                      <div class="type-couth">
                        <p class="title-types-share-summary p-simulator">PLAN CUOTAS EXTRA</p>
                        <p class="text-types-share-summary  p-simulator">
                                                Paga cuotas fijas mensuales y cuotas extra cada 6 meses.
                        </p>
                      </div>

                      <hr class="bar-summary1"> </hr>

                      <div class="type-couth">
                        <p class="title-types-share-summary  p-simulator">PLAN DOS TRAMOS</p>

                        <p class="text-types-share-summary  p-simulator">
                                                Paga una tasa menor durante los primeros 6 meses.
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div class="footer-finance-container">
                <div class="footer-form-summary-simulator">
                  {`Llevate un vehículo `}<b>{`${_formatMoney(this.price)} `}</b>
									{`a un plazo de `}<b>{`${shareSimulator} meses (${shareSimulator / 12} ${shareSimulator / 12 > 1 ? "años" : "año"}) `}</b>
                  {`con una cuota inicial de `}<b>{`${_formatMoney(this.shareInitValue)}`}</b>
									{` y una cuota mensual de `}<b>{`${_formatMoney(this.shareMonthValue + lifeInsurance)}.`}</b>
                </div>
              </div>
              <div class="btn-margin">
                <button class="bc-btn-primary bton-primary-mobile" onClick={this.onRedirectCredit}>
                                Solicitar Crédito
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
}

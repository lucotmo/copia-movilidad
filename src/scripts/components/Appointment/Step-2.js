import { h, Component, createRef } from "preact";

import BCAppointmentStepper from "./Stepper";
import { MK_ID, SC_API_URL } from "../../global/constants";
import { handleInputElements, handleCheckboxElements } from "../../base/forms";
import { showToastifyMessage } from "../../global/helpers";

export default class BCAppointmentS2 extends Component {
    docTypeRef = createRef();
    // sellerUrl = "https://qa-sellerbancolombia.blacksip.com/";
    sellerUrl = SC_API_URL;

    constructor(props) {
      super(props);
      this.state = {
        docType: {
          value: "CC",
          text: "Cédula de ciudadanía",
        },
        documentType: [
          { value: "CC", text: "Cédula de ciudadanía" },
          { value: "CE", text: "Cédula de extranjería" },
          { value: "PS", text: "Pasaporte" }
        ]
      };
    }

    

    handleNextStep = () => {
      let formatDateForHour = this.props.date;
        formatDateForHour.setHours(formatDateForHour.getHours()-5);

      if ($(".userFormData input:invalid").length || !$(".userFormData [name='terms']").prop("checked"))
        showToastifyMessage({ message: "Completa todos los campos para continuar", blockRepeat: true, type: "alert" });
      else {
        const userForm = {
          identification: $(".userFormData input[name='docnumber']").val(),
          identificationType: $(".userFormData input[name='doctype']").val(),
          givenName: $(".userFormData input[name='name']").val(),
          lastName: $(".userFormData input[name='lastname']").val(),
          email: $(".userFormData input[name='email']").val(),
          phoneNumber: $(".userFormData input[name='phone']").val(),
        };

        fetch(`${this.sellerUrl}/schedule/api/appointment/v1/create?marketplaceId=${MK_ID}`, {
          method: "POST",
          body: JSON.stringify({
            startTime: formatDateForHour,
            description: 'test',
            appointmentType: this.props.type == "test-drive" ? "DrivingTest" : "Concessionaire",
            vtexSellerId: productInfo['Id Seller'][0],
            vtexSkuId: productInfo.items[0].itemId,
            client: userForm,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.Status && res.Status > 300)
              showToastifyMessage({ message: res.Message || "Ocurrió un error al agendar la cita", blockRepeat: true, type: "alert" });
            else {
              userForm.AppointmentId = res.data && res.data.id ? res.data.id : '';
              this.props.onNext({
                propName: "userData",
                propValue: userForm,
              });
            }
          })
          .catch((error) => console.error("Error:", error));
      }
    };

    componentDidMount() {
      handleInputElements({ onKeyUp: true });
      handleCheckboxElements();

      $(".userFormData input[name='doctype']").val("cc");
      if (this.props.user && Object.keys(this.props.user).length) {
        const { user } = this.props;

        if (!!user.idType) $(".userFormData input[name='doctype']").val(user.idType);
        if (!!user.id) $(".userFormData input[name='docnumber']").val(user.id).addClass("fill");
        if (!!user.firstName) $(".userFormData input[name='name']").val(user.firstName).addClass("fill");
        if (!!user.lastName) $(".userFormData input[name='lastname']").val(user.lastName).addClass("fill");
        if (!!user.realEmail) $(".userFormData input[name='email']").val(user.realEmail).addClass("fill");
        if (!!user.phone) $(".userFormData input[name='phone']").val(user.phone).addClass("fill");

        $(".userFormData [name='terms']").prop("checked", true);
      }

      // Masking data for glia
      $(".userFormData input[name='docnumber']").addClass("sm_cobrowsing_masked_field");
      $(".userFormData input[name='name']").addClass("sm_cobrowsing_masked_field");
      $(".userFormData input[name='lastname']").addClass("sm_cobrowsing_masked_field");
      $(".userFormData input[name='email']").addClass("sm_cobrowsing_masked_field");
      $(".userFormData input[name='phone']").addClass("sm_cobrowsing_masked_field");
    }

    onSelectDocType = (e) => {
      $(this.docTypeRef.current).removeClass("bc-select--active");
      $(".userFormData input[name='doctype']").val($(e.target).data("value"));
      this.setState({ docType: { value: $(e.target).data("value"), text: $(e.target).data("text") } });
      e.preventDefault();
    };

    render(props, state) {
      const { onPrev, onClose, date, type, location } = props;
      const { docType, documentType } = state;
      return (
        <div className="userData bc-modal">
          <div className="userData__contentUser">
            {onPrev && (
              <span className="return-modal icon-angle-left" onClick={onPrev}>
                <p>Volver</p>
              </span>
            )}
            <span className="close-modal fenix-icon-error" onClick={onClose}></span>

            <BCAppointmentStepper state={["confirmed", "active", "default"]} />

            <div className="AppointmentCalendarInfo">
              <title>Escribe tu información personal</title>
              <div className="contentDate">
                <span className="desk calendar">Fecha y lugar seleccionado para prueba de manejo</span>
                <span className="mobile calendar">Fecha y lugar seleccionado:</span>
                <div className="infoDate">
                  <div className="icon"></div>
                  <p className="date">
                    {date
                      .toLocaleTimeString("es-CO", {
                        weekday: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        month: "long",
                        year: "numeric",
                      })
                      .replace(/\.\s/g, ".")}
                  </p>
                </div>
              </div>
              <div className="contentPlace">
                <div className="infoPlace">
                  <div className="icon"> </div>
                  <p className="place">
                    {location.name}
                    <span>{location.address}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="userFormData">
              <div className="bc-select__wrapper">
                <input type="hidden" name="doctype" />
                <div className="bc-select" ref={this.docTypeRef}>
                  <label className="bc-select__label">Tipo de documento</label>
                  <div
                    className="bc-select__input"
                    onClick={(e) => {
                      $(this.docTypeRef.current).toggleClass("bc-select--active");
                      e.preventDefault();
                    }}
                  >
                    <p>{docType.text}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    {documentType.map((dt) => (
                      <div
                        className="bc-select__option col-12"
                        data-value={dt.value}
                        data-text={dt.text}
                        onClick={this.onSelectDocType}
                      >
                        {dt.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bc-input m-bottom-1">
                <input name="docnumber" type="text" maxLength="50" pattern="[0-9]{7,12}" required />
                <span className="bc-input__highlight"></span>
                <label>Número de documento</label>
                <span className="bc-input__error">
                                Use sólo números, entre 7 y 12 caracteres
                </span>
              </div>
              <div className="bc-input m-bottom-1">
                <input
                  name="name"
                  type="text"
                  maxLength="50"
                  required
                  minLength="3"
                  pattern="[a-zA-Z]+[-_]*[a-zA-Z]+\s*[a-zA-Z]+"
                />
                <span className="bc-input__highlight"></span>
                <label>Nombres</label>
                <span className="bc-input__error">Ingresa al menos 3 caracteres alfabéticos.</span>
              </div>

              <div className="bc-input m-bottom-1">
                <input
                  name="lastname"
                  type="text"
                  maxLength="50"
                  required
                  minLength="3"
                  pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$"
                />
                <span className="bc-input__highlight"></span>
                <label>Apellidos</label>
                <span className="bc-input__error">Ingresa al menos 3 caracteres alfabéticos.</span>
              </div>

              <div className="bc-input m-bottom-1">
                <input
                  name="email"
                  type="email"
                  maxLength="50"
                  required
                  pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                />
                <span className="bc-input__highlight"></span>
                <label>Correo electrónico</label>
                <span className="bc-input__error">Ingresa tu dirección de correo en formato: nombre@ejemplo.com</span>
              </div>

              <div className="bc-input m-bottom-1">
                <input name="phone" type="tel" maxLength="50" pattern="[0-9]{9,12}" required />
                <span className="bc-input__highlight"></span>
                <label>Teléfono</label>
                <span className="bc-input__error">Use sólo números, entre 9 y 12 caracteres</span>
              </div>
              <div className="bc-terms-conditions">
                <div className="bc-checkbox m-top-3">
                  <input className="bc-checkbox__input" type="checkbox" name="terms" />
                  <div className="bc-checkbox__checkmark">
                    <i className="icon-check"></i>
                  </div>
                </div>
                <label className="m-top-3 bc-checkbox__label" for="terms">
                  <a href="https://www.grupobancolombia.com/tu360/terminos-y-condiciones" target="_blank">Autorizo el tratamiento de mis datos personales.</a>
                </label>
              </div>
            </div>
            <div className="sectionButtons">
              <button className="bc-btn-primary" onClick={this.handleNextStep}>
                            Continuar
              </button>
              <button className="bc-btn-secundary-white" onClick={onPrev}>
                            Volver
              </button>
            </div>
          </div>
        </div>
      );
    }
}

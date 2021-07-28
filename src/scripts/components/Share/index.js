import { h, Component, createRef } from "preact";
import { handleInputElements } from "../../base/forms";
import { showToastifyMessage } from "../../global/helpers";
import { SC_API_URL, MK_ID } from "../../global/constants";

export default class BCShare extends Component {
  emailShareForm = createRef();

  constructor(props) {
    super(props);
    this.state = { linkCopied: false };
  }

  componentDidMount() {
    handleInputElements();
  }

  handleCopyToClipboard = () => {
    const urlContainer = document.querySelector(".urlProduct input");

    urlContainer.focus();
    urlContainer.select();

    if (window.screen.width < 768) showToastifyMessage({ message: "Copiado al portapapeles", blockRepeat: true, type: "alert" });
    else {
      this.setState({ linkCopied: document.execCommand("copy") });
      setTimeout(() => this.setState({ linkCopied: false }), 3000);
    }
  };

  handleClickToSocialNetwork = (e) => {
    const socialNetworkMap = {
      wa: "https://wa.me/?text=",
      fb: "https://www.facebook.com/sharer/sharer.php?u=",
      tt: "https://twitter.com/share?url=",
    };
    const selectedNetwork = $(e.target).data("network");
    const { productURL } = this.props;

    window.open(`${socialNetworkMap[selectedNetwork]}${encodeURIComponent(productURL)}`, "_blank");
    e.preventDefault();
  };

  handleSubmitEmailShare = (e) => {
    e.preventDefault();

    const form = this.emailShareForm.current;

    const formElements = {
      name: form.elements[(name = "fromName")].value,
      emails: form.elements[(name = "toEmail")].value,
      message: form.elements[(name = "message")].value,
    };

    fetch(`${SC_API_URL}/product/api/products-core/v1/shared-product/?marketplaceId=${MK_ID}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic bW92aWxpZGFkY286MjIxRDhDRjJEMkQ5MjM1NjAzODlDNTZGNjA0RDhENkZGNjUxRDM1NDIwRjNCRDNFOERGRjhFMUM3N0Q4M0QyMQ=="
      },
      method: "POST",
      body: JSON.stringify({
        vtexSkuId: productInfo.items[0].itemId,
        ...formElements,
      }),
    }).then((res) => {
      if (res.ok) {
          showToastifyMessage({ message: "Compartido con éxito", blockRepeat: true, type: "success" });
          $(".shareProduct .js-toggle-modal").trigger("click");
      } else
          showToastifyMessage({
              message: "No podemos enviar el mensaje en este momento, intenta de nuevo más tarde.",
              blockRepeat: true,
              type: "alert",
          });
      
    });
  };

  render({ productURL }, { linkCopied }) {
    return (
      <div className="shareProductWrap bc-modal__wrapper hidden">
        <div className="shareProduct bc-modal">
          <span className="close-modal fenix-icon-error js-toggle-modal" data-modal=""></span>
          <title>¿Te gustaría la opinión de un amigo?</title>

          <div className="contentShare">
            <p>Comparte y pide la recomendación sobre este carro a uno de tus amigos.</p>
            <div className="contentUrl">
              <p>Copia y comparte el enlace</p>
              <div className="urlProduct">
                <input className="url" type="text" value={productURL} readOnly></input>

                <button onClick={this.handleCopyToClipboard}>
                  <div className="icon-copy" style={{ fontWeight: 400 }}></div>
                </button>

                {linkCopied && <span style="line-height: 24px;">Copiado al portapapeles</span>}
              </div>
            </div>

            <div className="contentSocialMedia">
              <p>Comparte en redes sociales</p>
              <ul>
                <li className="icon iconEmail"></li>
                <li className="icon iconWhatsapp" data-network="wa" onClick={this.handleClickToSocialNetwork}></li>
                <li className="icon iconFacebook" data-network="fb" onClick={this.handleClickToSocialNetwork}></li>
                <li className="icon iconTwitter" data-network="tt" onClick={this.handleClickToSocialNetwork}></li>
              </ul>
            </div>

            <form ref={this.emailShareForm} onSubmit={this.handleSubmitEmailShare}>
              <div className="contentSendMail">
                <p>Envía por correo</p>
                <p className="text m-bottom-2">Puedes agregar varios correos separandolos con coma(,).</p>

                <div className="bc-input m-bottom-1">
                  <input
                    className="sm_cobrowsing_masked_field"
                    name="fromName"
                    type="text"
                    maxLength="80"
                    minLength="3"
                    required
                    placeholder="Ingresa tu nombre para que tu amigo sepa quien envía el mensaje"
                  />
                  <span className="bc-input__highlight"></span>
                  <span className="bc-input__bar"></span>
                  <label>Escribe tu nombre</label>
                  <span className="bc-input__error">Campo obligatorio, mínimo 3 caracteres</span>
                </div>

                {/* <div className="bc-input m-bottom-1">
                            <input
                                name="toName"
                                type="text"
                                maxLength="80"
                                minLength="3"
                                required
                                placeholder="Ingresa el nombre de tu amigo"
                            />
                            <span className="bc-input__highlight"></span>
                            <label>Para</label>
                            <span className="bc-input__error">Campo obligatorio, mínimo 3 caracteres</span>
                        </div> */}

                <div className="bc-input m-bottom-1">
                  <input
                    className="sm_cobrowsing_masked_field"
                    name="toEmail"
                    type="email"
                    maxLength="80"
                    required
                    placeholder="Ingresa el correo de tu amigo"
                    pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                  />
                  <span className="bc-input__highlight"></span>
                  <label>Correo electrónico</label>
                  <span className="bc-input__error">Campo obligatorio, debe ser un correo válido</span>
                </div>

                <p className="m-top-2">Mensaje</p>
                <textarea name="message" className="mensaje" placeholder="Escribe tu mensaje aquí"></textarea>
              </div>

              <div className="sectionButton">
                <button type="submit" className="bc-btn-secundary-white">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

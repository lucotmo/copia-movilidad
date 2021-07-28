import { h, Component } from "preact";
import BCAppointmentStepper from "./Stepper";
import { MK_ID, SC_API_URL } from "../../global/constants";
export default class BCAppointmentS3 extends Component {
    // sellerUrl = "https://qa-sellerbancolombia.blacksip.com/";
    sellerUrl = SC_API_URL;
    
    commentAppointment = () => {
        const { user } = this.props;
        const description = $(".AppointmentConfirmed textarea[name='description']").val();
        fetch(`${this.sellerUrl}/schedule/api/appointment/v1/send-appointment?marketplaceId=${MK_ID}`, {
            method: "PUT",
            body: JSON.stringify({
                id: user.AppointmentId,
                description,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.Status && (res.Status === 404 || res.Status === 400))
                    showToastifyMessage({ message: res.Message, blockRepeat: true, type: "alert" });
                else {
                    this.props.onNext();
                }
            })
            .catch((error) => console.error("Error:", error));
    };

    render(props) {
        const { onNext, onClose, date, user, type, location } = props;
        let formatDateForHour = date;
        formatDateForHour.setHours(formatDateForHour.getHours()+5);

        console.log(type);

        return (
            <div className="confirmedAppointmentCalendar bc-modal">
                <span className="close-modal fenix-icon-error" onClick={onClose}></span>

                <BCAppointmentStepper state={["confirmed", "confirmed", "confirmed"]} />

                <div className="AppointmentConfirmed">
                    <title>{type == "test-drive" ? "Prueba de manejo agendada" : "Visita de concesionario agendada"}</title>
                    <p className="p-cemter">Te enviaremos un correo con toda la información de tu cita</p>
                    <div className="contentDate">
                        <span>Te esperamos en:</span>
                        <div className="infoDate">
                            <div className="icon"></div>
                            <p className="date">
                                {formatDateForHour
                                    .toLocaleTimeString("es-CO", {
                                        weekday: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                        month: "long",
                                        year: "numeric",
                                    })
                                    .replace(/\.\s/g, ".")
                                    /* .replace("a.m.", "")
                                    .replace("p.m.", "") */}
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

                    <div className="dataContactUser">
                        <span>Tus datos de contacto son:</span>
                        <div className="infoUser">
                            <div className="name">
                                <div className="iconUser"></div>
                                <p className="name">{`${user.givenName} ${user.lastName}`}</p>
                            </div>
                            <div className="phone">
                                <div className="iconPhone"></div>
                                <p className="phone">+57 {user.phoneNumber}</p>
                            </div>
                            <div className="email">
                                <div className="iconEmail"></div>
                                <p className="email">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* <p>¿Tienes un minuto?</p>
                    <p>Si quieres, puedes contarnos cuáles son tus necesidades y expectativas del vehículo para ofrecerte una mejor experiencia el día de tu visita.</p>
                    <textarea name="description" className="mensaje" placeholder="Escribe tu mensaje aquí" maxLength="1200"></textarea> */}
                    <div className="sectionButtons">
                        {/* <button className="bc-btn-primary" onClick={this.commentAppointment}>
                            Enviar
                        </button> */}
                        <button className="bc-btn-secundary-white" onClick={onClose}>
                            Cerrar
                            {/* Omitir */}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

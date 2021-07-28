import { h, Component, createRef } from "preact";

import { eraseCookie } from "../../global/cookieUtility";
import BCLogin from "../Login";
import BCAppointmentS1 from "./Step-1";
import BCAppointmentS2 from "./Step-2";
import BCAppointmentS3 from "./Step-3";
import { UserServices } from "../../global/user";
import { login } from "../../global/helpers";

export default class BCAppointment extends Component {
    mainContainerRef = createRef();
    
    constructor(props) {
      super(props);
      this.state = {
        step: 1,
        appointmentType: "",
        date: "",
        userData: {},
        location: props.product.seller ? { name: props.product.seller.businessName, address: props.product.seller.address } : {},
      };
    }

    handleOnLogin = () => login();

    handleNextStep = (data) => {
      if (data) {
        if (data.constructor === Array)
          for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const isValidProp = element && element.propName && Object.keys(this.state).includes(element.propName);

            if (isValidProp) this.setState(() => ({ [element.propName]: element.propValue }));
          }
        else {
          const isValidProp = data && data.propName && Object.keys(this.state).includes(data.propName);

          if (isValidProp) this.setState(() => ({ [data.propName]: data.propValue }));
        }
      }
      this.setState((prevState) => ({ step: prevState.step + 1 }));
    };

    handlePrevStep = () => {
      const user = UserServices.getUserData();
      if(user && user.isUserDefined && this.state.step === 3){
        this.setState((prevState) => ({ step: prevState.step - 2 }));
      }else{
        this.setState((prevState) => ({ step: prevState.step - 1 }));
      }
    };

    handleClose = () => {
      $(this.mainContainerRef.current).addClass("hidden");
      $(document.body).removeClass("ovh");
      this.setState({ step: 1, appointmentType: "", date: "", userData: {}, location: {} });
      eraseCookie('modalAgen');
    };

    handleSetAppointmentType = (e) => {
      const user = UserServices.getUserData();
      if (user && user.isUserDefined) {
          const { id, idType } = UserServices.getUserIdInfo();
          this.setState((prevState) => ({
              step: prevState.step + 2,
              appointmentType: $(e.target).data("type"),
              userData: { id, idType, ...user },
          }));
      } else {
          this.setState((prevState) => ({ step: prevState.step + 1, appointmentType: $(e.target).data("type") }));
      }
      
      e.preventDefault();
    };

    componentDidCatch(err) {
      console.log(err);
    }

    render(_, state) {
      const { step, appointmentType, date, userData, location } = state;
      return (
        <div className="procesoAgendarCita bc-modal__wrapper hidden" ref={this.mainContainerRef}>
          {step === 1 && (
            <div className="optionsAgendarCita bc-modal">
              <div className="optionsAgendarCita__selectCitaYestDrive">
                <title>Elige una opción para conocer tu próximo carro</title>
                <span className="close-modal fenix-icon-error js-toggle-modal" data-modal="procesoAgendarCita"></span>

                <div className="options">
                  {this.props.isConcessionaire === true && 
                  <button
                  className={`agendarCita ${appointmentType === "appointment" ? "active" : ""}`}
                  data-type="appointment"
                  onClick={this.handleSetAppointmentType}
                >
                  <div className="icon"></div>
                  <p>Agendar cita con el concesionario</p>
                </button>
                  }

                  {
                    this.props.isDrivingTest === true && <button
                    className={`testDrive ${appointmentType === "test-drive" ? "active" : ""}`}
                    data-type="test-drive"
                    onClick={this.handleSetAppointmentType}
                  >
                    <div className="icon"></div>
                    <p>Agendar prueba de manejo</p>
                  </button>
                  }

                  {/* <button
                    className={`agendarCita ${appointmentType === "appointment" ? "active" : ""}`}
                    data-type="appointment"
                    onClick={this.handleSetAppointmentType}
                  >
                    <div className="icon"></div>
                    <p>Agendar cita con el concesionario</p>
                  </button> 

                  <button
                    className={`testDrive ${appointmentType === "test-drive" ? "active" : ""}`}
                    data-type="test-drive"
                    onClick={this.handleSetAppointmentType}
                  >
                    <div className="icon"></div>
                    <p>Agendar prueba de manejo</p>
                  </button>
                  */}


                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <BCLogin
              onBack={this.handlePrevStep}
              onGuest={this.handleNextStep}
              onLogin={this.handleOnLogin}
              onClose={this.handleClose}
              type={appointmentType}
            />
          )}

          {step === 3 && (
            <BCAppointmentS1
              onNext={this.handleNextStep}
              onPrev={this.handlePrevStep}
              onClose={this.handleClose}
              type={appointmentType}
              user={userData}
              date={date}
              location={location}
            />
          )}

          {step === 4 && (
            <BCAppointmentS2
              onNext={this.handleNextStep}
              onPrev={this.handlePrevStep}
              onClose={this.handleClose}
              type={appointmentType}
              date={date}
              user={userData}
              location={location}
            />
          )}

          {step === 5 && (
            <BCAppointmentS3
              onNext={this.handleClose}
              onClose={this.handleClose}
              date={date}
              user={userData}
              type={appointmentType}
              location={location}
            />
          )}
        </div>
      );
    }
}

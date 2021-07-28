import { h } from "preact";

const BCAppointmentStepper = ({ state }) => (
    <div className="bc-stepper-three">
        <div className="content-stepper">
            <div className="timeline"></div>
            <div className={`content-stepper__step-one step ${state[0]}`}>
                <div className="point"></div>
                <div className="stepName">Lugar y Fecha</div>
                <div className="stepNameMobile">Paso 1</div>
            </div>
            <div className={`content-stepper__step-two step ${state[1]}`}>
                <div className="point"></div>
                <div className="stepName"> Datos de contacto</div>
                <div className="stepNameMobile">Paso 2</div>
            </div>
            <div className={`content-stepper__step-three step ${state[2]}`}>
                <div className="point"></div>
                <div className="stepName">Confirmación</div>
                <div className="stepNameMobile">Paso 3</div>
            </div>
        </div>
    </div>
);

export default BCAppointmentStepper;

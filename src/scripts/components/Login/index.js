import { h } from "preact";
import { setCookie, getCookie } from "../../global/cookieUtility";
import { UserServices } from "../../global/user";

$( window ).on( "load", () => {
    let stateCookie = getCookie('modalAgen');
    let user = UserServices.getUserData();

    if (stateCookie != null && user != null) {
        setTimeout(() => {        
            if (stateCookie == 'true' && user.isUserDefined == true) {        
                $(".agendarCita").click();
            } else if (user.isUserDefined == false) {
                eraseCookie('modalAgen');
            }
        }, 100);
    }
});


const BCLogin = (props) => {
    const { onBack, onGuest, onClose, onLogin } = props;

    return (
        <div className="optionsIniciarSesion bc-modal">
            <div className="selectIngreso">
                {onBack && (
                    <span className="return-modal fenix-icon-arrow2-left" onClick={onBack}>
                        <p>Volver</p>
                    </span>
                )}
                <span className="close-modal fenix-icon-error" onClick={onClose}></span>
                <p className="infoProcess">
                    Si tienes cuenta entra con ella, sino puedes entrar como invitado.
                </p>
                <div className="options">
                    <div className="inicioBancolombia" onClick={ () => { setCookie('modalAgen', true, 0.02083); onLogin() }}>
                        <div className="icon"></div>
                        <p>Ingresar a mi perfil de Bancolombia</p>
                    </div>
                    <div className="invitado" onClick={onGuest}>
                        <div className="icon"></div>
                        <p>Seguir como invitado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BCLogin;
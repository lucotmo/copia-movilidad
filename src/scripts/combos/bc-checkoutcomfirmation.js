import { h, render } from "preact";

import "../../templates/components/bc-pageloader";
import BCCcomfirmation from "../components/Checkout-Comfirmation";

let funcsComfirmation = (function () {
    const init = () => {
        renderComponents();
    };

    const renderComponents = () => {
        let orderNum = getUrlParameter("og");
        let nameent = $(".cconf-profile .lh-copy .mt0.mb1:first-child").text().split(" ");
        $("#app-top").before(`<div id="app-top-new" class="cf">
            <div class="ph3-ns w-70-ns db center">
                <div class="mb4">
                    <h1 class="f2 black-70 mb1">¡${nameent[0]} ${nameent[1]} : ¡Lista la reserva!</h1>
                    <time class="gray"><span>Te enviamos un mensaje al correo electrónico con todos los datos de tu reserva.</span></time>
                </div>
            </div>
        </div>`);

        $("#app-top").after(`<div id="app-container-container" class="container"></div>`);

        render(<BCCcomfirmation preventOvh orderNumber={orderNum} />, document.querySelector("#app-container-container"));
    };

    const getUrlParameter = (sParam) => {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split("&"),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split("=");

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    return { init };
})();

$(document).ready(() => {
    funcsComfirmation.init();
});

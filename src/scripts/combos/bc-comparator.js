import { h, render } from "preact";
import Comparator from "../components/Comparator";
import ComparatorServices from "../base/comparator";

const comparatorFunctions = (() => {
    const init = () => {
        render(<Comparator />, document.querySelector(".js-comparator"));
        handleStickyTop();
    };

    const handleStickyTop = () => {
        const stickyTopContainer = $(".sticky-top-comparator");

        // $(document).on("scroll", function () {
        //     if (window.scrollY > 200) stickyTopContainer.addClass("sticky");
        //     else stickyTopContainer.removeClass("sticky");
        // });

        stickyTopContainer.find(".close").on("click", function (e) {
            // stickyTopContainer.hide();
            // e.preventDefault();
            var productList = ComparatorServices.getProductList();
            var category = ComparatorServices.getCategory();
            
            productList.forEach(element => {
                ComparatorServices.removeProduct(element.id)
            });
            window.location.href = category
        });
    };

    return { init };
})();

$(document).ready(comparatorFunctions.init);

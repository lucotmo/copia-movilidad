import fetch from "unfetch";
import { updateQueryStringParam, storeID } from "../global/helpers";
import { VTEX_STOREID_FIELD, SC_API_URL, MK_ID } from "../global/constants";

const storeFunctions = (function () {
  let _storeIDReview = storeID.getStoreID().replace(/&/g,",").split(",");

  if(Array.isArray(_storeIDReview)){
    if(_storeIDReview.length > 1){
      _storeIDReview = _storeIDReview[0];
    }
  }
  
  const _storeID = _storeIDReview;
  const sellerUrl = SC_API_URL;
  const init = () => {
    document.title = "Store - Bancolombia Movilidad";
    fetchSellerData();
    cleanHTML();
  };

  const fetchSellerData = () => {
    fetch(`${sellerUrl}/seller/api/v1/get-by-id-vtext/${_storeID}/?marketplaceId=${MK_ID}`)
      .then((res) => res.json())
      .then((sellerData) => {
        if (sellerData && Object.keys(sellerData).length) {
          const $container = $(".store__banner");

          let sinceDate = new Date(sellerData.creationTime).toLocaleString("es-CO", { month: "long", year: "numeric" });
          sinceDate = `${sinceDate[0].toUpperCase()}${sinceDate.slice(1)}`;

          $container.find(".dealer-photo img").attr("src", sellerData.logo);
          $container.find(".dealer-date").text(`Concesionario desde ${sinceDate}`);
          $container
            .find(".dealer-phone .icon")
            .replaceWith(
              sellerData.phone ? `<a href="tel:${sellerData.phone}"><div class='icon'></div></a>` : "<div class='icon'></div>"
            );
          $container
            .find(".dealer-phone p")
            .replaceWith(
              sellerData.phone ? `<a href="tel:${sellerData.phone}">${sellerData.phone}</a>` : "<p>No Disponible</p>"
            );
          $container
            .find(".dealer-email .icon")
            .replaceWith(
              sellerData.email ? `<a href="mailto:${sellerData.email}"><div class='icon'></div></a>` : "<div class='icon'></div>"
            );
          $container
            .find(".dealer-email p")
            .replaceWith(
              sellerData.email ? `<a href="mailto:${sellerData.email}">${sellerData.email}</a>` : "<p>No Disponible</p>"
            );

          $container.find(".dealer-location").on("click", function (e) {
            window.location.href = `/localizador?fq=${VTEX_STOREID_FIELD}:${_storeID}`;
            e.preventDefault();
          });

          $(".js-seller-name").text(sellerData.sellerName);
        }
      })
      .catch((err) => {
        console.error("Debug: Error on fetch seller data", err);
      });
  };

  const cleanHTML = () => {
    const orderBySelect = $(".resultado-busca-filtro .orderBy select");
    const filterBySelect = $(".resultado-busca-filtro .filterBy select");

    orderBySelect.removeAttr("onchange");
    orderBySelect.on("change", function () {
      updateQueryStringParam({ key: "O", value: this.options[this.selectedIndex].value, useHref: true });
    });

    filterBySelect.removeAttr("onchange");
    filterBySelect.on("change", function () {
      updateQueryStringParam({ key: "PS", value: this.options[this.selectedIndex].value, useHref: true });
    });

    $(".resultado-busca-termo .value").remove();
  };

  return { init };
})();

$(document).ready(storeFunctions.init);

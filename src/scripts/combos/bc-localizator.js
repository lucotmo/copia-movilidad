import { storeID } from "../global/helpers";
import { handleSelectElements } from "../base/forms";
import { VTEX_STOREID_FIELD, SC_API_URL, MK_ID } from "../global/constants";

let funcionalidadesLocalizator = (function () {
  const _storeID = storeID.getStoreID();
  const sellerUrl = SC_API_URL;

  let init = function () {
    document.title = "Localizador - Bancolombia Movilidad";
    Postrender();
    breadcrumbStore();
  };

  const breadcrumbStore = () => {
    fetch(`${sellerUrl}/seller/api/v1/get-by-id-vtext/${_storeID}/?marketplaceId=${MK_ID}`)
      .then((res) => res.json())
      .then((sellerData) => {
        console.log(sellerData);
        $('.breadcrumb .last').before(`<li><a href="/store?fq=${VTEX_STOREID_FIELD}:${_storeID}">${sellerData.sellerName}</a></li>`);
      });
  };

  const ObveservableSelect = (father, select, dropdown) => {
    $(father + " .bc-select #" + dropdown).remove();
    $(father + " .bc-select").append('<div class="bc-select__options row" id="' + dropdown + '"></div>');
    $(select + " option").each(function () {
      if ($(this).is(":selected")) {
        $(father + " .bc-select .bc-select__input p").text($(this).text());
        $("#" + dropdown + "").append(
          '<div class="bc-select__option col-12 active" valref="' + $(this).val() + '">' + $(this).text() + "</div>"
        );
      } else {
        $("#" + dropdown + "").append(
          '<div class="bc-select__option col-12" valref="' + $(this).val() + '">' + $(this).text() + "</div>"
        );
      }
    });

    $("#" + dropdown + " .bc-select__option").on("click", function () {
      let data = $(this).attr("valref");
      if (data != "") {
        $(select).val(parseInt(data)).trigger("change");
        if (dropdown == "cities") {
          ObveservableSelect(".selectStore", ".store-selector", "stores");
          $(".selectStore .bc-select .bc-select__input p").css("color", "#808285");
        }
      } else {
        $(select).val($("select option:first").val()).trigger("change");
        $(".infoTienda").html(" ");
        if (dropdown == "cities") {
          $(".selectStore .bc-select #stores").remove();
          $(".selectStore .bc-select .bc-select__input p").text("Todos");
        }
      }
    });

    handleSelectElements();
  };

  const handleRenderFilters = () => {
    if ($(".city-selector").length) ObveservableSelect(".selectCiudad", ".city-selector", "cities");
    if ($(".store-selector").length) ObveservableSelect(".selectStore", ".store-selector", "stores");

    $(".bc-select__wrapper").each((_, el) => {
      if (el.parentElement.querySelector("select") === null) el.querySelector(".bc-select").classList.add("bc-select--disabled");
      else el.querySelector(".bc-select").classList.remove("bc-select--disabled");
    });
  };

  const makeSlick = () => {
    $(".infowindow .images-container").slick({ slidesToShow: 1, slidesToScroll: 1 });
  };

  const Postrender = () => {
    $(".boxMapa").bind("click", "img", function () {
      $(".bc-select__wrapper").find(".bc-select").removeClass("bc-select--active");
      $(".bc-select").find("p").css("color", "#000");
      ObveservableSelect(".selectCiudad", ".city-selector", "cities");
      ObveservableSelect(".selectStore", ".store-selector", "stores");
    });
    $(".bc-select__wrapper").each((_, el) => {
        $(".selectCiudad").on("click", function() {
          $(".selectStore").find(".bc-select--active").removeClass("bc-select--active");
        })
        $(".selectStore").on("click", function() {
          $(".selectCiudad").find(".bc-select--active").removeClass("bc-select--active");
        })
      });
    $(document).on("StoreLocator:MapInitialized", () => setTimeout(handleStoreIDInQueryParam, 800));
    $(document).on("Locator:finishedFiltersRenderingEvent", handleRenderFilters);
    $(document).on("storeLocator:openInfowindow", makeSlick);
  };

  const handleStoreIDInQueryParam = () => {
    if (storeID.isStoreIDInHref()) {
      const _storeID = storeID.getStoreID();
      let store = window.moduleSystem.storeLocator
        .getDescendantStoresListByPath("0")
        .filter((store) => store.storeID == _storeID);
      if (store && store[0]) {
        $(document).trigger("StoreLocator:SelectFilter", store[0].filter);
        handleRenderFilters();
      }
      else console.warn("Can't find store #" + _storeID + " in store locator data");
    }
  };

  return { init };
})();

$(document).ready(funcionalidadesLocalizator.init);

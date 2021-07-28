import { h, render } from "preact";
import fetch from "unfetch";

import shelfFunctions from "../base/shelf";
import { VTEX_STOREID_FIELD, SC_API_URL, MK_ID, ACCESS_TOKEN } from "../global/constants";
import productController from "../vendor/controllers/productControllers";
import BCAppointment from "../components/Appointment";
import BCShare from "../components/Share";
import BCReservation from "../components/Reservation";
import BCCredit from "../components/Credit";
import BCLeasing from "../components/Leasing";
import { handleWishlist } from "../global/helpers";

const productFunctions = (() => {
  let controllerConfig = {};

  const init = () => {
    if (typeof vtexjs !== "undefined") {
      controllerInit(); // Run controllers first of all
      // getIswish();
    } else devMode();

    // let sellerUrl = "https://qa-sellerbancolombia.blacksip.com";

    productActionSectionScroll();

    handleToggleTabs();
    handleModalsAndLink();
    mobileStickButtons();
    shelfFunctions.init({ slickShelf: true });
  };

  const productActionSectionScroll = () => {
    $(document).scroll(function() {
      if ($(document).scrollTop() > 800) {
          $( ".productSection__info__actionSection" ).addClass( "active" );
          $( ".financiacion" ).text( "financiación" );
      }
      else if ($(document).scrollTop() < 800){
          $( ".productSection__info__actionSection" ).removeClass( "active" );
          $( ".financiacion" ).text( "Conocer financiación" );
      }
    });
  }

  /*==============================================================================*/
  // Activar modal de galeria ampliada del producto y recalcula el slider
  $('.expand-btn').on("click", () => {
    $( ".productSection__expand__gallery" ).addClass( "active_modal" );

    if ($(window).width() > 768) {
      $('.expand__gallery .productSection__slider__imageFull').slick('resize');
      $('.expand__gallery .productSection__slider__imageCarrusel').slick('resize');
    }
    else if ($(window).width() <= 768 && $('.expand__gallery .productSection__slider__imageCarrusel').hasClass('slick-initialized')) {
      $('.expand__gallery .productSection__slider__imageFull').slick('resize');
      $('.expand__gallery .productSection__slider__imageCarrusel').slick('resize');
      setTimeout(() => {
        $('.expand__gallery .productSection__slider__imageFull').slick('unslick');
        $('.expand__gallery .productSection__slider__imageCarrusel').slick('unslick');
      }, 100);
    }
  });
  // Cerrar modal de galeria ampliada
  $('.productSection__expand__gallery .close-modal').on("click", () => {
    $( ".productSection__expand__gallery" ).removeClass( "active_modal" );
  });
  /*==============================================================================*/

  const devMode = () => {
    $(".productSection__slider__imageFull > div").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      dots: true,
      fade: true,
      infinite: true,
      autoplay: false,
      asNavFor: "productSection__slider__imageCarrusel  > div",
      responsive: [
        {
          breakpoint: 768,
          settings: {
            arrows: true,
          },
        },
      ],
    });

    $(".productSection__slider__imageCarrusel  > div").slick({
      slidesToShow: 5,
      slidesToScroll: 2,
      asNavFor: ".productSection__slider__imageFull  > div",
      centerMode: false,
      vertical: false,
      focusOnSelect: false,
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: true,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            centerMode: false,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: false,
          },
        },
      ],
    });

    $(".bc-shelf-container__items > ul").slick({
      autoplay: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      dots: true,
      arrows: true,
      infinite: true,
      customPaging: () => "",
      lazyLoad: "ondemand",
      focusOnSelect: false,
      centerMode: false,
      autoplaySpeed: 4500,
      speed: 800,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
          },
        },
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 769,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 500,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: false,
            variableWidth: true,
          },
        },
      ],
    });

    $(".bc-shelf-container__items .slick-initialized").slick("slickGoTo", 0);
    render(<BCCredit />, document.querySelector(".js-credit"));
    render(<BCLeasing />, document.querySelector(".js-leasing"));
  };


  const controllerInit = () => {
    controllerConfig = {
      productName: ".product-name",
      productInfoContainer: ".productSection__info",
      productRegularPrice: ".price", // For now products only have list price

      images: {
        arrowsToMainSlider: window.screen.width < 1089,
        numberThumbsInSlide: 5,
        mainContainer: ".productSection__slider__imageFull",
        thumbsContainer: ".productSection__slider__imageCarrusel",
      },

      specifications: {
        description: {
          title: {},
          content: {
            path: ".productSection__info__secondary .productDescription",
            structure: "<p>{{content}}</p>",
          },
        },
        Marca: {
          title: {
            path: ".js-tab-basic ul",
            structure: '<li class="spec-brand">Marca</li>',
          },
          content: {
            path: ".js-tab-basic .spec-brand",
            structure: '<div><img src="/arquivos/{{content}}.png" alt="Product Brand" /></div>',
          },
        },
        Peritaje: {
          title: {},
          content: {
            path: ".productSection__tabsMoreInfo .contentDownload",
            structure: '<a class="descarga link" target="_blank" href="{{content}}" download></a>',
          },
        },
        "Ficha técnica": {
          title: {},
          content: {
            path: ".productSection__tabsMoreInfo .contentDownload",
            structure: '<a class="descarga" target="_blank" href="{{content}}" download>Ficha técnica</a>',
          },
        },
      },
    };

    ["Condición", "KM", "Transmisión", "Departamento"].forEach((spec) => {
      controllerConfig.specifications = {
        ...controllerConfig.specifications,
        [spec]: {
          title: {},
          content: {
            path: `.attributesPrincipales #${spec} .contentAttribute`,
            structure: '<p class="attribute-value">{{content}}</p>',
          },
        },
      };
    });

    ["Modelo", "Línea", "Versión", "Potencia", "Watts (kW)", "Combustible", "Cilindraje (motor)", "Dirección", "Color", "Airbags", "No. Puertas", "Ultimo dígito placa", "Capacidad", "Tracción", "Peso (kg)", "Cojinería"].map(
      (spec, index) => {
        controllerConfig.specifications = {
          ...controllerConfig.specifications,
          [spec]: {
            title: {
              structure:
                spec == "No. puertas"
                  ? `<li class="slickCntr spec-${index}">Puertas</li>`
                  : `<li class="slickCntr spec-${index}">{{title}}</li>`,
              path: ".js-tab-basic ul",
            },
            content: {
              structure: '<p class="content">{{content}}</p>',
              path: `.js-tab-basic .spec-${index}`,
            },
          },
        };


        // let specArr1 = document.getElementsByClassName("slickCntr");
        //   console.log('specArr1 length:', specArr1.length);

        // $(window).load(() => {
        //   let specArr = document.querySelectorAll("li[class*='spec-']");
        //   console.log('specArr length:', specArr.length);

        // if(document.querySelectorAll("li[class*='spec-']").length >10)
        // console.log('si:', document.querySelectorAll("li[class*='spec-']").length)

        // });

      }


    );

    [
      "ABS",
      "Vidrios eléctricos",
      "Multimedia",
      "Aire acondicionado",
      "Bloqueo central",
      "Keyless access",
      "Alarma",
      "Rines de lujo",
      "Espejos eléctricos",
      "Asientos eléctricos",
      "Calefacción",
    ].forEach((spec) => {
      controllerConfig.specifications = {
        ...controllerConfig.specifications,
        [spec]: {
          conditional: "si",
          replacer: { key: /[eE]+(lectrico)/g, value: 'eléctrico', key: "ABS", value: 'Frenos ABS' },
          title: {
            structure: `<li>{{title}}</li>`,
            path: ".js-tab-equip ul",
          },
          content: {},
        },
      };
    });


    productController(controllerConfig);
    $(document).on("fillProductInfo:ProductInfoLoaded", onProductInfoLoaded);
    $(document).on("fillProductInfo:SpecificationsRendered", onSpecsRender);

    // $(window).load(function () {
    //   let specArr = document.querySelectorAll("li[class*='spec-']");
    //   console.log('specArr:', specArr)
    // });

  };


  const onProductInfoLoaded = function (_, productInfo) {
    window.productInfo = productInfo;

    const $sellerButton = $(".productSection__info .nameSeller");
    const storeID = productInfo["Id Seller"][0];
    if (storeID) {
      $sellerButton.on("click", function () {
        window.location.href = `/store?fq=${VTEX_STOREID_FIELD}:${storeID}`;
      });

      fetch(`${SC_API_URL}/seller/api/v1/get-by-id-vtext/${storeID}/?marketplaceId=${MK_ID}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((seller) => {
          window.productInfo = { ...productInfo, seller };
          if (seller) {
            $sellerButton.html(seller.sellerName);
          } else {
            $sellerButton.html(productInfo.items[0].sellers[0].sellerName);
          }
          renderComponents();
        });
    } else {
      if (seller) { $sellerButton.html(seller.sellerName); }
      else { $sellerButton.html(productInfo.items[0].sellers[0].sellerName); }
      renderComponents();
    }

    getAppointmentTypes();
    handleWishlist({ button: ".wishlistIcon" });

    fetch(`${SC_API_URL}/product/api/products-core/most-visited?marketplaceId=${MK_ID}`, {
      headers: {
        "Content-Type": "application/json",
        "accessToken": `${ACCESS_TOKEN}`
      },
      method: "POST",
      body: JSON.stringify({
        vtexSkuId: productInfo.items[0].itemId,
      }),
    });
  };

  const getAppointmentTypes = () => {
    let sellerUrl = SC_API_URL;
    let currentDate = new Date();
    let isDrivingTest = false;
    let isConcessionaire = false;
    fetch(
      `${sellerUrl}/schedule/api/v1/get-availability-by-sku-status?SkuId=${productInfo.items[0].itemId}&AppointmentType=DrivingTest&Day=${currentDate.getDay()}&marketplaceId=${MK_ID}`
    )
      .then((driveTestRes) => driveTestRes.json())
      .then((driveTestSchedule) => {
        if (driveTestSchedule.valid) {
          isDrivingTest = true;
          fetch(
            `${sellerUrl}/schedule/api/v1/get-availability-by-sku-status?SkuId=${productInfo.items[0].itemId}&AppointmentType=Concessionaire&Day=${currentDate.getDay()}&marketplaceId=${MK_ID}`
          )
            .then((concessTestRes) => concessTestRes.json())
            .then((concessSchedule) => {
              // concessSchedule.length = isConcessionaire ? true : false;
              if (concessSchedule.valid) {
                // console.log('si hay cita concesionario');
                isConcessionaire = true;
              }
              else {
                // console.log('no hay cita concesionario');
                isConcessionaire = false;
              }
              readVars(isDrivingTest, isConcessionaire);
            })
            .catch((err) => console.error(err));

        }

        else {
          isDrivingTest = false;
          fetch(
            `${sellerUrl}/schedule/api/v1/get-availability-by-sku-status?SkuId=${productInfo.items[0].itemId}&AppointmentType=Concessionaire&Day=${currentDate.getDay()}&marketplaceId=${MK_ID}`
          )
            .then((resp) => resp.json())
            .then((respSchedule) => {
              // schedule.length = isConcessionaire ? true : false;
              if (respSchedule.valid) {
                // console.log('si hay cita concesionario');
                isConcessionaire = true;
              }

              else {
                // console.log('no hay cita concesionario');
                isConcessionaire = false;
                // readVars(isDrivingTest, isConcessionaire);
              }
              readVars(isDrivingTest, isConcessionaire);
            })
            .catch((err) => console.error(err));

        }
      })
      .catch((err) => console.error(err));
  };



  const readVars = (isDrivingTest, isConcessionaire) => {
    // console.log('variables:', isDrivingTest, isConcessionaire)
    if (isDrivingTest === false && isConcessionaire === false) {
      $('.agendarCita.js-toggle-modal').hide();
    }
    else {
      render(<BCAppointment product={productInfo} isDrivingTest={isDrivingTest} isConcessionaire={isConcessionaire} />, document.querySelector(".js-make-appointment"));
    }
  }


  const renderComponents = () => {
    // const { productInfo } = window;

    // render(<BCAppointment product={productInfo} />, document.querySelector(".js-make-appointment"));
    render(<BCShare productURL={productInfo.link} />, document.querySelector(".js-share-product"));
    render(<BCReservation product={productInfo} />, document.querySelector(".js-reservation"));
    render(<BCCredit product={productInfo} />, document.querySelector(".js-credit"));
    render(<BCLeasing product={productInfo} />, document.querySelector(".js-leasing"));
  };

  const onSpecsRender = (_, productInfo) => {
    $(".contentDownload .descarga").not('[href="URL_pdf"]').length && $(".contentDownload").removeClass("hidden");

    $("[data-atributename=KM]").text(new Intl.NumberFormat(["ban", "id"]).format(parseInt($("[data-atributename=KM]").text())));

    $(".attributesPrincipales").on("init", function () {
      const container = $(".attributesPrincipales");
      container.fadeIn();

      container.find(".contentAttribute").each(function () {
        if ($(this).find(".attribute-value").length === 0) $(this).append("<p> - </p>");
      });
    });

    $(".attributesPrincipales").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: false,
      arrows: false,
      variableWidth: true,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            dots: true,
          },
        },
      ],
    });

    $(".containerPDP .bread-crumb ul li:last-child").removeClass("last");
    $(".containerPDP .bread-crumb ul").append(`<li class="last">${productInfo.items[0].name}</li>`);
  };

  const handleToggleTabs = () => {
    $(".containerPDP .bread-crumb ul li:first-child a").text("Vehículos");
    $(".containerPDP .bread-crumb ul li:nth-child(2)").remove();
    $(document).on("click", ".tabs .tab", function (e) {
      const _this = $(this);
      const otherTab = _this.closest(".tabs").find(".tab.active");

      if (_this.hasClass("active")) return;

      _this.addClass("active");
      $(_this.data("tab")).removeClass("hidden");
      otherTab.removeClass("active");
      $(otherTab.data("tab")).addClass("hidden");

      e.preventDefault();
    });
    $(document).mouseup(function (e) {
      var container = $(".shareProduct");

      // if the target of the click isn't the container nor a descendant of the container
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('.shareProductWrap').addClass('hidden');
      } 
    });
  };

  const handleModalsAndLink = () => {
    $(document).on("click", ".js-toggle-modal", function (e) {
      $(`.${$(this).data("modal")}`).toggleClass("hidden");
      $(document.body).toggleClass("ovh");
      e.preventDefault();
    });

    $(document).on("click", ".js-credit-link", function (e) {
      let scrollTop = $(".productSection__solicitudDeFinanciacion").offset().top;
      $("html").animate({ scrollTop }, 800, "swing");
      e.preventDefault();
    });
  };

  const mobileStickButtons = () => {
    if (typeof IntersectionObserver === "undefined") return;

    const iOberverOptions = {
      root: null,
      rootMargin: "0px",
      threshold: [0.25],
    };
    const iOberver = new IntersectionObserver((entries) => {
      const outOfBounds = window.scrollY < 800 || window.scrollY >= document.querySelector(".bc-shelf-container").offsetTop;

      entries.forEach((entry) => {
        if (window.screen.width < 1089)
          if (entry.isIntersecting || outOfBounds) $(".actionSectionStickyMobile").addClass("hidden");
          else $(".actionSectionStickyMobile").removeClass("hidden");
      });
    }, iOberverOptions);

    iOberver.observe(document.querySelector(".productSection__info__actionSection"));
    //iOberver.observe(document.querySelector(".bc-shelf-container"));
  };

  return { init };
})();

$(document).ready(productFunctions.init);

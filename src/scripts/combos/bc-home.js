import { h, render } from "preact";

import BCSearch from "../components/Search";
import shelfFunctions from "../base/shelf";
import CarruselProjs from "../components/CarruselProjs";
import VitrineItemsRecoments from "../components/Recomendados/ProjectRecoments/carrusel";
import { getRecoments } from "../global/helpers";

const homeFuncs = (() => {
    
    const init = () => {
        renderComponents();
        handleScrollToSearch();
        sliders();
        expandCardEdu();

        shelfFunctions.init({ slickShelf: true });

        // Se agrega y se debe descomentar para activar sliders cards home
        // shelfFunctions.init({ slickShelf: true, imgCollections: true });
        numberWithCommas();
    };

    const renderComponents = async () => {
        render(<BCSearch />, document.querySelector(".bc-home-search"));
        render(<CarruselProjs />, document.querySelector(".carousel-projs"));
        
        try {
            let getProductos = await getRecoments();
            if (!getProductos.filter(item => item.hasOwnProperty("items")).length) {
                getProductos = getProductos?.map(prod => {
                    return {
                        ...prod,
                        items: [{ images: prod.images }]
                    }
                });
            }
            render(<VitrineItemsRecoments products={getProductos} />, document.querySelector(".shelf-wrapper"));
        } catch (error) {
            console.log("Error on request recoments", error);
            $('.bc-modal__wrapper.fullpage-loader').hide()
        }

    };

    const handleScrollToSearch = () => {
        $(".main-banner__down").on("click", (e) => {
            let scrollTop = $(".bc-home-search").offset().top - $(".main-banner__title").height() * 1.4;
            $("html").animate({ scrollTop }, 500, "swing");
            e.preventDefault();
        });
    };

    const numberWithCommas = () => {
        var y = document.getElementsByClassName("numbertoFormat");
        for (let i = 0; i < y.length; i++) {
            var getNumber = $(y[i]).find(".product-field li").text();
            $(y[i])
                .find(".product-field li")
                .text(getNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }
    };

    const sliders = () => {
        const makeCardsSlick = () =>
            $(".card__wrap")
                .not(".slick-initialized")
                .slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: false,
                    infinite: false,
                    centerMode: true,
                    focusOnSelect: true,
                    slide: '.card__edu',
                    centerPadding: window.screen.width <= 320 ? "10px" : "0px",
                });

        if (window.screen.width < 1024) makeCardsSlick();

        $(window).on("resize orientationchange", function () {
            if (window.screen.width < 1024) makeCardsSlick();
            else $(".card__wrap.slick-initialized").slick("unslick");
        });
    };

    const expandCardEdu = () => {
        $('.btn_expand').click(function () {
            var element = $(this);
            var fatherCardBanner = element.parents(".secondBanner");
            var fatherCardEdu = element.parents(".card__edu");

            if (fatherCardBanner.hasClass('active__expand') && fatherCardBanner.hasClass('secondBanner')) {
                fatherCardBanner.removeClass('active__expand');
                element.children('i').removeClass('fenix-icon-error');
                element.children('i').addClass('fenix-icon-arrow-right');
            } else if (fatherCardBanner.hasClass('secondBanner')) {
                fatherCardBanner.addClass('active__expand');
                element.children('i').removeClass('fenix-icon-arrow-right');
                element.children('i').addClass('fenix-icon-error');
            } else if (fatherCardEdu.hasClass('active__expand') && fatherCardEdu.hasClass('card__edu')) {
                fatherCardEdu.removeClass('active__expand');
                fatherCardEdu.siblings('.card__edu').removeClass('active__reduce');
                element.children('i').removeClass('fenix-icon-error');
                element.children('i').addClass('fenix-icon-arrow-right');
            } else if (fatherCardEdu.hasClass('card__edu')) {
                fatherCardEdu.addClass('active__expand');
                fatherCardEdu.siblings('.card__edu').addClass('active__reduce');
                element.children('i').removeClass('fenix-icon-arrow-right');
                element.children('i').addClass('fenix-icon-error');
            }
        })
    }

    return { init };
})();

$(document).ready(homeFuncs.init);


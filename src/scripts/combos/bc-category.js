import { h, render } from "preact";
import shelfFunctions from "../base/shelf";
import BCSearchCategory from "../components/Search-Category";
import { SITE_CATEGORY_KEY } from "../global/constants";

const funcionalidadesCategoria = (function () {
    let init = function () {
        handleRenderProducts();
        renderComponents();
        handleMobileActions();
        handleLoadMoreProducts();
        cleanHTML();
        numberWithCommas();
        nameWithFormat();
        shelfFunctions.init({ slickShelf: false, imgCollections: true });
        imgInSearch();
    };

    const renderComponents = () => {
        const serachContainer = document.querySelector(".bc-category-search");
        if (serachContainer) render(<BCSearchCategory preventOvh />, serachContainer);
    };

    // Forzar que se vea la imagen para que no se superponga el buscador de filtro
    const imgInSearch = () => {
        let imgArr = $('.filters__banner').find('img')
        // let picArr = $('.filters__banner').find('picture');
        if (imgArr.length === 0) {
            // $('.filters__banner').append('<img src="/arquivos/acelera-la-busqueda-de-tu-vehiculo.jpg" alt="" srcset=""/>');
            $('.filters__banner').append('<picture><source media="(max-width: 1024px)" srcset="/arquivos/acelera-la-busqueda-de-tu-vehiculo-tb.jpg?v=637352940811700000"><img src="/arquivos/acelera-la-busqueda-de-tu-vehiculo.jpg?v=637407182186200000" alt="Acelera la búsqueda de tu vehículo con Bancolombia"/></picture>');
        }
    }

    const cleanHTML = () => {
        $(".products__list .main .searchResultsTime .resultado-busca-numero .label").remove(); 
        $(".products__list .main .searchResultsTime .resultado-busca-termo .label").html(
            "carros cumplen con tus criterios de selección:"
        );
        $(".products__list .main .searchResultsTime .resultado-busca-tempo").remove();
        $(".products__list .main .resultado-busca-filtro .compare").remove();
        $(".products__list .main .pager.top").remove();
        $(".products__list .main .resultado-busca-filtro .orderBy").append('<i class="fenix-icon-arrow2-down"></i>');
        $(".products__list .main .resultado-busca-filtro .filterBy").append('<i class="fenix-icon-arrow2-down"></i>');
        $(".products__list .main .sub:nth-child(1)").remove();
        $(".products__list .main ").find(".sub").slice(1, 2).remove();
        $(".products__list .main ").find(".searchResultsTime").slice(1, 2).remove();
        const recomendedContainer = document.querySelector(".recomendados");
        if (!recomendedContainer) {
            const $filterBy = $(".resultado-busca-filtro .filterBy");
            $filterBy.html($filterBy.html().replace("Productos por página", "Productos por página:"));
            let lengthItem = $(".n4colunas > ul > li").length;
            $("#PS > option").each(function () {
                // if (parseInt($(this).attr("value")) !== 16 && $(this).attr("value") !== lengthItem) {
                if (parseInt($(this).attr("value")) === 64) {
                    $(this).remove();
                }
            });
        }
        $(".products__list .main .resultItemsWrapper ul li.helperComplement").remove();
        // $(".products__list .main ")
        //     .find(".sub")
        //     .append(
        //         '<div class="products__switch"><div class= "products__switch-container"><span class="icon-one-column active"></span><span class="icon-two-columns"></span></div></div>'
        //     );
        $(".products__list .main .resultado-busca-filtro").append('<button class="FilterBy">Filtrar por<i class="fenix-icon-arrow2-down"></i></button>');
        $(".products__list .main .resultado-busca-filtro .orderBy select > option:first-child").text("Ordenar por");
        $(".breadCrumb .bread-crumb ul li:first-child a").text("Buscar vehículo");
        $(".breadCrumb .bread-crumb ul li:nth-child(2) a").text("Resultado de búsqueda");
        $(".breadCrumb .bread-crumb ul li").find('a[title="Carros"]').parent().remove();
        $(".bc-btn-icon-ghost fieldset label").text("Comparar");

        $(".orderBy select option").each(function () {
            if (
                $(this).val() == "OrderByBestDiscountDESC" ||
                $(this).val() == "OrderByTopSaleDESC" ||
                $(this).val() == "OrderByReviewRateDESC"
            ) {
                $(this).remove();
            } else {
                if ($(this).val() == "OrderByPriceASC") $(this).text("Menor precio");
                if ($(this).val() == "OrderByPriceDESC") $(this).text("Mayor precio");
                if ($(this).val() == "OrderByReleaseDateDESC") {
                    $(this).text("Fecha de subida");
                    $(".orderBy select").find("option[value='OrderByPriceDESC']").after(this);
                }
            }
        });

        let numberOfPages = document.getElementsByClassName("page-number");
        if (numberOfPages.length === 1) $(".pager.bottom").hide();
    };

    const handleRenderProducts = () => {
        const productListMutationObserver = new MutationObserver((mutationList) => {
            mutationList = mutationList[0];
            const addedNodes = mutationList.addedNodes;
            if (addedNodes.length > 0) {
                for (let i = 0; i < addedNodes.length; i++) {
                    const node = addedNodes[i];
                    if (node.nodeType === 1 && node.classList.contains("bc-shelf-container__items"))
                        shelfFunctions.init({ slickShelf: false, imgCollections: true });
                }
            }
        });
        productListMutationObserver.observe(document.body, { childList: true, subtree: true });
    };

    const handleMobileActions = () => {
        const reInitSlickShelf = () => {
            let imgSlickSlider = $(".bc-shelf-item__top .slick-initialized");
            if (imgSlickSlider.length) {
                imgSlickSlider.slick("unslick");
                imgSlickSlider.not(".d-flex").slick({
                    autoplay: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: true,
                    infinite: false,
                });
            }
        };

        $(".products__list").on("click", ".icon-one-column", () => {
            $(".icon-one-column").addClass("active");
            $(".icon-two-columns").removeClass("active");
            $(".products__list .main .resultItemsWrapper div[class*='colunas']").removeClass("x2");
            reInitSlickShelf();
        });

        $(".products__list").on("click", ".icon-two-columns", () => {
            $(".icon-two-columns").addClass("active");
            $(".icon-one-column").removeClass("active");
            $(".products__list .main .resultItemsWrapper div[class*='colunas']").addClass("x2");
            reInitSlickShelf();
        });

        $(".products__list").on("click", ".FilterBy", () => {
            if ($('.header_movil_advanced').length == 0) {
                $(".bc-category-search").append('<h3 class="header_movil_advanced">Filtros avanzados<i class="fenix-icon-error Close-filt"></i></h3>');
            }
            $(".bc-category-search").on("click", ".Close-filt", () => $(".bc-category-search").hide());
            $(".bc-category-search").show();

            if ($('.bc-category-search').find('.bc-search-modal-lg__wrapper').length == 0) {
                $(".bc-search__adv-search").click();
            }
        });
    };

    const numberWithCommas = () => {
        var y = document.getElementsByClassName("numbertoFormat");
        for (let i = 0; i < y.length; i++) {
            var getNumber = $(y[i]).find(".product-field li").text();
            var result = getNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            $(y[i]).find(".product-field li").text(result);
        }
        var x = document.getElementsByClassName("bc-shelf-item__body");
        for (let i = 0; i < x.length; i++) {
            var getNumber = $(x[i]).find(".bc-shelf-item__price").text();
            var result = getNumber.split(",");
            $(x[i]).find(".bc-shelf-item__price").text(result[0]);
        }
    };

    const nameWithFormat = () => {
        let productName = document.getElementsByClassName("bc-shelf-item__body");
        for (let i = 0; i < productName.length; i++) {
            let getName = $(productName[i]).find(".bc-shelf-item__name").text();
            let nStr = getName.search("-")
            let newName = getName.slice(nStr + 1)
            $(productName[i]).find(".bc-shelf-item__name").text(newName);
        }
    };

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    
    function replaceAll(string, search, replace) {
        return string.split(search).join(replace);
    }

    function handleLoadMoreProducts() {

        let pageNumber = 1;
        let noMore = false;
        let loading = false;

        $(".bc-category__load-more button").on("click", function (e) {
            const shelfID = SITE_CATEGORY_KEY;
            const perPage = getParameterByName("PS") ? getParameterByName("PS") : 8;
            const OrderBy = getParameterByName("O") ? getParameterByName("O") : "OrderByTopSaleDESC";

            if (!noMore && !loading) {
                pageNumber++;
                let searchURL = "/buscapagina?";

                if (vtxctx && vtxctx.searchTerm) {
                    searchURL = `${searchURL}ft=${vtxctx.searchTerm}&`;
                }

                const urlParams = new URLSearchParams(window.location.search);
                const fq = urlParams.get("fq");
                if (fq) {
                    searchURL = `${searchURL}fq=${fq}&`;
                }

                if (!window.location.pathname.includes("/busca") && vtxctx) {
                    const departament = vtxctx.departmentyId;
                    const category = vtxctx.categoryId;

                    if (departament === category) searchURL = `${searchURL}fq=C:/${departament}/&`;
                    else searchURL = `${searchURL}fq=C:${departament}/${category}&`;
                }

                const request = $.ajax({
                    url: `${searchURL}PS=${perPage}&sl=${shelfID}&cc=1000&PageNumber=${pageNumber}&sm=0&O=${OrderBy}`,
                    method: "GET",
                    dataType: "html",
                    beforeSend: function () {
                        loading = true;
                        $(".more-products").addClass("show");
                        $(".bc-category__load-more").hide();
                    },
                });

                request.done(function (msg) {
                    if (msg == "" || msg == null || msg == undefined) {
                        noMore = true;
                        loading = false;
                        $(".more-products").removeClass("show");
                    } else {
                        msg = msg.replace('<html><head><META NAME="ROBOTS" CONTENT="NOINDEX, FOLLOW"></head><body><div class="prateleira n8colunas">', '');
                        msg = msg.replace('</div></body></html>', '');
                        msg = replaceAll(msg, ',00', '');
                        loading = false;
                        $("body .products__list .resultItemsWrapper div[class*='colunas']").append(msg);
                        $(".more-products").removeClass("show");
                        $(".bc-category__load-more").show();
                    }
                });

                request.fail(function (_, textStatus) {
                    console.error("Request failed: " + textStatus);
                });
            }
        });
    }

    return { init };
})();

$(document).ready(funcionalidadesCategoria.init);

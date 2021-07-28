import "easyzoom";
import lozad from "lozad";
import { _formatMoney } from "../../global/helpers";

const productControllers = function productControllers(customConfig) {
    /* Default Config */
    const config = {
        productName: null,
        productInfoContainer: null,
        productBestPrice: null,
        productListPrice: null,
        productRegularPrice: null,
        productDisscountContainer: null,

        images: {
            dimensionChangingImg: null,

            arrowsToMainSlider: false,
            autoRotateImages: false,
            bindThumbs: true,
            numberThumbsInSlide: 3,
            varticalThumbs: false,

            mainContainer: null,
            thumbsContainer: null,

            waitingClass: "waitingImgs",
            initialImage: 0,
        },

        specifications: null,
    };

    let skuJson = window.skuJson;

    const observer = lozad();
    const init = function init() {
        /* Asigna la configuración del usuario */
        $.extend(true, config, customConfig);

        /* Valida y aplica la configuracion responsive */
        if (config.responsive) {
            var deviceMatch = false;

            $.each(config.responsive, function (breakpoint, responsiveConfig) {
                if (parseInt(breakpoint) >= $(window).width() && !deviceMatch) {
                    $.extend(config, responsiveConfig);
                    deviceMatch = true;
                }
            });
        }

        if (config.customSkuJson) skuJson = config.customSkuJson;

        productImages();
        fillProductInfo();
    };

    function productImages() {
        var currentImgSkuId;
        var productSelectedImages = new Object();
        var imagesLoaded = 0;
        var currentDimensionContainer;
        var thumbsCounter = "";

        var init = function init() {
            // Inicia el modulo llamando las las imagenes del primer sku del producto //
            searchImages(skuJson.skus[0].sku);
            currentImgSkuId = skuJson.skus[0].sku;
        };

        /* Si las imagenes de este SKU no han sido cargadas previamente, llama las imagenes del sku seleccionado */
        function searchImages(skuId) {
            clearSlider();

            if (skuId in productSelectedImages) {
                fillImagesSlider();
            } else {
                $.ajax({
                    url: "/produto/sku/" + skuId,
                    method: "get",
                })
                    .done(function (data) {
                        if (typeof data !== "undefined" && data.length > 0) {
                            var imagesArray = data[0].Images;
                            productSelectedImages[currentImgSkuId] = getImagesData(imagesArray);
                            fillImagesSlider();
                        } else {
                            console.error("No se encontraron imagenes para el sku " + skuId);
                            waitingImgs();
                        }
                    })
                    .fail(function (error) {
                        console.error(error);
                        waitingImgs();
                    });
            }
        }

        /* Limpia el Slider de imagenes del producto */
        function clearSlider() {
            imagesLoaded = 0;
            thumbsCounter = "";

            if ($(config.images.mainContainer).hasClass("slick-initialized")) {
                $(config.images.mainContainer).slick("unslick");
                $(config.images.mainContainer).empty();
            }
            if ($(config.images.thumbsContainer).hasClass("slick-initialized")) {
                $(config.images.thumbsContainer).slick("unslick");
                $(config.images.thumbsContainer).empty();
            }
        }

        /* Agrega una clase al selector de dimensiones y al Slider de imagenes del producto mientras se cargan las imagenes de producto que se han llamado. */
        function waitingImgs() {
            if (currentDimensionContainer) {
                $(currentDimensionContainer).toggleClass(config.images.waitingClass);
                $(config.images.mainContainer).toggleClass(config.images.waitingClass);
                $(config.images.thumbsContainer).toggleClass(config.images.waitingClass);
            }
        }

        /* Selecciona y guarda la informacion de las imagenes que se han cargado */
        function getImagesData(imagesArray) {
            var skuSelectedImages = new Array();

            $.each(imagesArray, function (imageIndex, imageSizes) {
                var imageSizesLinks = {
                    mainImage: "",
                    zoomImage: "",
                    thumbImage: "",
                };

                $.each(imageSizes, function (imageSizeIndex, imageSizeData) {
                    // TODO: Fix the size of images
                    switch (imageSizeData.ArchiveTypeId) {
                        case 2:
                            imageSizesLinks.mainImage = imageSizeData.Path.replace("-292-292", "-640-360");
                            break;
                        case 3:
                            imageSizesLinks.thumbImage = imageSizeData.Path.replace("-55-55", "-328-320");
                            break;
                        case 10:
                            imageSizesLinks.zoomImage = imageSizeData.Path;
                            break;
                    }
                });

                skuSelectedImages.push(imageSizesLinks);
            });

            return skuSelectedImages;
        }

        /* Imprime las imagenes seleccionadas en el contenedor de imagenes del producto */
        function fillImagesSlider() {
            var imagesSliderBig = "";
            var imagesSliderSmall = "";
            var selectedImages = productSelectedImages[currentImgSkuId];

            $.each(selectedImages, function (_, valueImages) {
                imagesSliderBig += `<div class="easyzoom easyzoom--overlay">
                 	<a class="product-image__wrapper" href="${valueImages.zoomImage}">
                			<img class="lozad product-image__img" data-src="${valueImages.mainImage}" src="${valueImages.mainImage}" alt="${skuJson.name}"/>
                 	</a>
                </div>`;
                if (selectedImages.length === 1) {
                    imagesSliderSmall += `<div class="product-image__thumb__one__product">
                        <img class="lozad" data-src="${valueImages.thumbImage}" src="${valueImages.thumbImage}" alt="${skuJson.name}"/>
                    </div>`;
                } else {
                    imagesSliderSmall += `<div class="product-image__thumb">
                        <img class="lozad" data-src="${valueImages.thumbImage}" src="${valueImages.thumbImage}" alt="${skuJson.name}"/>
                    </div>`;
                }
            });

            if (selectedImages.length > config.images.numberThumbsInSlide)
                thumbsCounter = `<div class="product-image__thumb-indicatorNumber">
                  +${selectedImages.length - config.images.numberThumbsInSlide}
                </div>`;

            $(config.images.mainContainer).append(imagesSliderBig);
            $(config.images.thumbsContainer).append(imagesSliderSmall);

            observer.observe();
            initMainImagesZoom();
        }

        /* Espera a que carguen las imágenes e inicia 'EasyZomm' en las imgenes principales del producto */
        function initMainImagesZoom() {
            var imagenesCounter = 1;
            var totalImages = $(config.images.mainContainer + " img" + ", " + config.images.thumbsContainer + " img").length;

            $(config.images.mainContainer + " img" + ", " + config.images.thumbsContainer + " img").each(function (index, value) {
                $(this).load(function () {
                    if (imagenesCounter == totalImages) {
                        var windowSize = $(window).width();
                        initSliders();
                        waitingImgs();
                        windowSize > 1023 && $(".easyzoom").easyZoom({ loadingNotice: "Cargando" });
                    } else imagenesCounter++;
                });
            });
        }

        /* Inicia 'Slick' en el slider de las imagenes de producto */
        function initSliders() {
            $(config.images.mainContainer).on("init", function (event, slick) {
                finishValidate("main");
            });
            $(config.images.thumbsContainer).on("init", function (event, slick) {
                finishValidate("thubs");
            });

            $(config.images.mainContainer + ":not(.slick-initialized)").slick({
                initialSlide: config.images.initialImage,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: config.images.autoRotateImages,
                autoplaySpeed: 7000,
                arrows: config.images.arrowsToMainSlider,
                dots: config.images.thumbsContainer ? false : true,
                asNavFor: config.images.bindThumbs ? config.images.thumbsContainer : null,
                accessibility: true,
                fade: true,
            });

            $(config.images.thumbsContainer + ":not(.slick-initialized)")
                .slick({
                    slidesToShow: config.images.numberThumbsInSlide,
                    slidesToScroll: 1,
                    asNavFor: config.images.bindThumbs ? config.images.mainContainer : null,
                    dots: false,
                    vertical: config.images.varticalThumbs,
                    verticalSwiping: true,
                    arrows: !config.images.arrowsToMainSlider,
                    adaptiveHeight: true,
                    focusOnSelect: true,
                })
                .on("afterChange", (_, { slideCount, $slider }) => {
                    const thumbsCounter = $($slider).find(".product-image__thumb-indicatorNumber");
                    const currentThumb = parseInt(thumbsCounter.html());

                    if (thumbsCounter.length && slideCount - 5 > 0) {
                        if (currentThumb - 1 > 0) thumbsCounter.html(`+${currentThumb - 1}`);
                        else thumbsCounter.remove();
                    }
                });

            if (thumbsCounter) {
                $(config.images.thumbsContainer).append(thumbsCounter);
                thumbsCounter = "";
            }

            function finishValidate(sliderId) {
                /* Emite un evento en el momento en el que se cargan las imagenes de la variación seleccionada del producto. */
                if (sliderId == "thumbs" || !config.images.thumbsContainer)
                    $(document).trigger("productImages:Images_Loaded", [productSelectedImages[currentImgSkuId]]);
            }
        }

        return init();
    }

    function fillProductInfo() {
        var init = function init() {
            fillNameAndPrices();
            bringExtraInfo();
        };

        /* Imprime el nombre y el precio inicial del producto */
        function fillNameAndPrices() {
            var availableSkuFound = false;

            let nStr = skuJson.name.search("-")
            let newName = skuJson.name.slice(nStr + 1)
            skuJson.name = newName;
            $(config.productName).html(skuJson.name);
            for (var i = 0; i < skuJson.skus.length && availableSkuFound == false; i++) {
                if (skuJson.skus[i].available == true) {
                    availableSkuFound = true;
                    var availableSku = skuJson.skus[i];
                    var prices = {
                        bestPriceTax: _formatMoney(availableSku.bestPrice / 100),
                        listPriceTax: _formatMoney(availableSku.listPrice / 100),
                    };

                    if (availableSku.listPrice > availableSku.bestPrice) {
                        var discount = ((availableSku.listPrice - availableSku.bestPrice) / availableSku.listPrice) * 100;

                        $(config.productBestPrice).html(prices.bestPriceTax);
                        $(config.productListPrice).html(prices.listPriceTax);
                        $(config.productDisscountContainer)
                            .html(Math.floor(discount) + "%")
                            .show()
                            .attr("style", "display: inline-block");
                    } else if (availableSku.listPrice) {
                        $(config.productRegularPrice).html(prices.listPriceTax);
                    } else {
                        $(config.productRegularPrice).html(prices.bestPriceTax);
                    }
                }
            }
        }

        function handleProductVideo(videoURL) {
            var videoId = videoURL.split("v=")[1];
            if (videoId.indexOf("&") != -1) videoId = videoId.substring(0, videoId.indexOf("&"));

            var mainContent = `<div>
                        <div class="product-image__wrapper">
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>`;
            var thumbContent = `<div class="product-image__thumb">
                        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" alt="Product Vídeo"/>
                    </div>`;
            var mainContainer = $(config.images.mainContainer);
            var thumbsContainer = $(config.images.thumbsContainer);

            if (mainContainer.hasClass("slick-initialized")) mainContainer.slick("slickAdd", mainContent);
            else mainContainer.append(mainContent);

            if (thumbsContainer.hasClass("slick-initialized")) thumbsContainer.slick("slickAdd", thumbContent);
            else thumbsContainer.append(thumbContent);
        }

        /* Trae la información adicional de este producto */
        function bringExtraInfo() {
            $.ajax({
                url: "/api/catalog_system/pub/products/search/?fq=productId:" + skuJson.productId,
                method: "GET",
            }).done(function (productInfo) {
                let nStr = productInfo[0].items[0].name.search("-")
                let newName = productInfo[0].items[0].name.slice(nStr + 1)
                productInfo[0].items[0].name = newName
                $(document).trigger("fillProductInfo:ProductInfoLoaded", productInfo);

                if (productInfo[0].items[0] && productInfo[0].items[0].Videos[0])
                    handleProductVideo(productInfo[0].items[0].Videos[0]);

                if (config.specifications) {
                    fillSpecifications(productInfo);
                    window.productInfo = productInfo[0];
                } else {
                    console.warn("SPECIFICATIONS: No has configurado las especificaciones del producto aun.");
                }
            });
        }

        /* Inserta las especificaciones del producto */
        function fillSpecifications(productInfo) {
            $.each(config.specifications, function (specName, specConfig) {
                var processedContent;
                var processedTitle;
                if (productInfo[0][specName]) {
                    var content =
                        typeof productInfo[0][specName] === "string" ? productInfo[0][specName] : productInfo[0][specName][0];
                    if (specConfig.conditional && specConfig.conditional !== content.toLowerCase()) return;

                    /* Inserta el titulo de la especificacion */
                    if (specConfig.title) {
                        if (specConfig.title.structure) {
                            processedTitle = $(
                                specConfig.title.structure.replace(
                                    /\{{title}}/g,
                                    specConfig.replacer
                                        ? specName.replace(specConfig.replacer.key, specConfig.replacer.value)
                                        : specName
                                )
                            ).attr("data-atributename", specName);
                        } else {
                            processedTitle = specName;
                            $(specConfig.title.path).attr("data-atributename", specName);
                        }

                        $(specConfig.title.path).append(processedTitle);
                    } else {
                        console.warn("SPECIFICATIONS: No hay configuración para el titulo de " + specName);
                    }

                    /* Inserta el contenido de la especificacion */
                    if (specConfig.content) {
                        var formatedContent =
                            config.splitContent && content.indexOf(config.splitContent.character) > -1
                                ? splitContent(content)
                                : content;
                        if (specConfig.content.structure) {
                            processedContent = $(specConfig.content.structure.replace(/\{{content}}/g, formatedContent)).attr(
                                "data-atributename",
                                specName
                            );
                        } else {
                            processedContent = formatedContent;
                            $(specConfig.content.path).attr("data-atributename", specName);
                        }

                        $(specConfig.content.path).append(processedContent);
                    } else {
                        console.warn("SPECIFICATIONS: No hay configuración para el contenido de " + specName);
                    }
                } else {
                    console.warn("SPECIFICATIONS: " + specName + " no es un atributo de este producto.");
                }
            });

            /* Divide los textos segun el caracter configurado en el 'splitContent.character' */
            function splitContent(rawContent) {
                var contentParts = rawContent.split(config.splitContent.character);
                var contentFormated = "";

                $.each(contentParts, function (partIndex, partText) {
                    if (partText != "") {
                        config.splitContent.wraper
                            ? (contentFormated += config.splitContent.wraper.replace(/\{{content}}/g, partText))
                            : (contentFormated += config.splitContent.character + partText + " <br>");
                    }
                });

                return contentFormated;
            }

            // Handle product available stock
            if (config.availableStock && productInfo[0].items[0] && productInfo[0].items[0].sellers[0]) {
                // Hide buy button on product out of stock
                if (productInfo[0].items[0].sellers[0].commertialOffer.AvailableQuantity === 0) {
                    // Hide the prices box on quickview
                    if (config.isQuickview) $(config.pricesBoxSelector).hide();
                    $(config.buyButton).hide();
                } else {
                    if (config.isQuickview) $(config.pricesBoxSelector).show();
                    $(config.buyButton).show();
                }
                $(config.availableStock).text(
                    productInfo[0].items[0].sellers[0].commertialOffer.AvailableQuantity + " unidades disponibles"
                );
            }

            $(document).trigger("fillProductInfo:SpecificationsRendered", productInfo);
        }

        return init();
    }

    return init();
};

export default productControllers;

import lozad from "lozad";
import { h, render } from "preact";
import { subscribe } from "pubsub-js";
import fetch from "unfetch";

import ComparatorServices from "./comparator";
import { PUBSUB_COMPARATOR } from "../global/constants";
import ComparatorList from "../components/Comparator/ComparatorList";
import { handleWishlist } from "../global/helpers";

const shelfFunctions = (() => {
  const init = ({ slickShelf, imgCollections }) => {
    fixPriceDecimals();
    lozadShelfImg();
    handleCompare();
    nameWithFormat();
    handleWishlist({container: ".bc-shelf-item", button: ".js-add-to-wl", dataSelector: "productid"});
    if (slickShelf) makeSlick();
    if (imgCollections || $('.bc-shelf-item__top').length > 0) loadImagesCollection();
  };

  const makeSlick = function () {
    const maxDots = 4;

    $(".helperComplement").remove();

    $(".bc-shelf-container__items > ul")
      .not(".slick-initialized")
      .slick({
        autoplay: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        dots: true,
        arrows: false,
        infinite: false,
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
      })
      .on("afterChange", (_, { currentSlide, slideCount, $slider }) => {
        currentSlide = currentSlide + 1;
        $($slider)
          .parents()
          .find(".bc-shelf-container__counter")
          .html(currentSlide + " / " + slideCount);

        if (slideCount > maxDots && currentSlide < slideCount) {
          $(".bc-shelf-container__items ul.slick-dots").animate(
            {
              scrollLeft: ($(".bc-shelf-container__items ul.slick-dots li").width() + 20) * (currentSlide - 1),
            },
            100
          ).show();
        }
      });

    $(".bc-shelf-container__items .slick-initialized").slick("slickGoTo", 0);
  };

  const loadImagesCollection = () => {
    let searchURL = "/api/catalog_system/pub/products/search/";

    $(".bc-shelf-item").each(function (index, el) {
      searchURL += `${index === 0 ? "?" : "&"}fq=productId:${el.dataset.productid}`;
    });

    fetch(searchURL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length) {
          data.forEach((product) => {
            const $container = $(`.bc-shelf-item.product-${product.productId} .bc-shelf-item__top`);
            const $midContainer = $(`.bc-shelf-item.product-${product.productId}`);
            const $imagesContainer = $(document.createElement("div"));
            const imagesCollectionHTML = product.items[0].images.map(
              (img) =>
                `<a class="bc-shelf-item__img" href="${product.link}"> <img src="${img.imageUrl}" alt="${img.imageText}"/> </a>`
            );
            
            if (!!$container) {
              $(`.product-${product.productId} .slick-initialized.slick-slider`).remove()
              $imagesContainer.html(imagesCollectionHTML);
              $container.find(".bc-shelf-item__img").remove();
              $container.prepend($imagesContainer);
              $imagesContainer.slick({
                autoplay: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                infinite: false,
              });
              $midContainer.data('category', product.categories[0].split('/')[2])

            }
          });
        }
      });
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

  const fixPriceDecimals = () => {
    $(".bc-shelf-item__price").each(function () {
      const _this = $(this);
      if (_this.text().includes(",")) _this.text(_this.text().split(",")[0]);
    });
  };

  const lozadShelfImg = () => {
    const images = document.querySelectorAll(".bc-shelf-item__img");
    const observer = lozad(images);
    observer.observe();
  };

  const changeCategory = () => {
    $(".bc-shelf-item")
  }

  const handleCompare = () => {
    const comparatorListContainer = document.querySelector(".js-compare-list");
    comparatorListContainer && !comparatorListContainer.innerHTML && render(<ComparatorList />, comparatorListContainer);

    const handleRemoveItem = () =>
      $(".bc-shelf-item").each(function () {
        const _this = $(this);

        if (_this.data("added") && !ComparatorServices.isProductInList(_this.data("productid"))) {
          _this.find(".js-compare i").replaceWith('<i class="icon-exchange"></i>');
          _this.removeData("added");
          _this.removeClass('add-compare');
        }
      });

    subscribe(PUBSUB_COMPARATOR.add, (_, productList) => {
      productList.forEach((product) => {
        const shelfItem = $(`.bc-shelf-item.product-${product.id}`);

        if (shelfItem.length && !shelfItem.data("added")) {
          shelfItem.data("added", true);
          shelfItem.addClass('add-compare');
          shelfItem.find(".js-compare i").replaceWith('<i class="icon-check-circle"></i>');
        }
      });
      
    });

    subscribe(PUBSUB_COMPARATOR.remove, handleRemoveItem);
    subscribe(PUBSUB_COMPARATOR.clear, handleRemoveItem);

    $(".bc-shelf-item__foot .js-compare").each(function () {
      const _this = $(this);
      const $container = _this.parents(".bc-shelf-item");

      if (ComparatorServices.isProductInList($container.data("productid"))) {
        $container.data("added", true);
        $container.addClass('add-compare');
        _this.find("i").replaceWith('<i class="icon-check-circle"></i>');
      }

      _this.on("click", function (e) {
        if ($container.data("added")) return ComparatorServices.removeProduct($container.data("productid"));

        const product = {
          id: $container.data("productid"),
          category: $container.data("category"),
          name: $container.find(".bc-shelf-item__name").text(),
          price: $container.find(".bc-shelf-item__price").text(),
          image: $container.find(".bc-shelf-item__img img").attr("src"),
          status: $container.find(".product_field_19 ul li").text() || "",
          model: $container.find(".product_field_23 ul li").text() || "",
          km: $container.find(".product_field_25 ul li").text() || "",
          location: $container.find(".product_field_20 ul li").text() || "",
        };

        ComparatorServices.addProduct(product);
        e.preventDefault();
      });
    });

    
  };

  return { init };
})();

export default shelfFunctions;

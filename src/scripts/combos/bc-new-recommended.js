import shelfFunctions from "../base/shelf";
import { SC_MIDDLE_API } from "../global/constants";
import { _formatMoney } from "../global/helpers";


const funcionalidadesRecomendados = (function () {

    const recommendedContainer = $(".n4colunas ul");
    let topMessage = $(".label");
    let isBackupActive = false;
    
    let init = function () {
      handleLoadRecommended();
      filtersRecommended();
    };

    function handleLoadRecommended(filter = '') {
        let user = JSON.parse(localStorage.getItem("userData"));
    
        if (!user) isBackupActive = true;

        recommendedContainer.empty();

        if (!isBackupActive) {
            var request = $.ajax({
                url: `${SC_MIDDLE_API.recoments}${user ? `?email=${user.userEmail}` : "" }`,
                method: "GET",
                headers: { "Content-Type": "application/json", authorization: `Bearer ${user.userToken}` },
            });
            request.done(function (data) {
                if (data.length > 0) {
                    topMessage.html("Recomendaciones para ti")
                    renderRecommended(data);
                } else {
                  isBackupActive = true;
                  loadBackup(filter);
                }
            });
            request.fail(function (_, textStatus) {
                isBackupActive = true;
                loadBackup(filter);
            });

        } else {
            loadBackup(filter);
        }
    }

    function loadBackup (filter = '') {
        $.ajax({
            url: `/api/catalog_system/pub/products/search?O=${filter}`,
            method: "GET",
        }).done(backup => {
            topMessage.html("Recomendaciones para ti")
            renderRecommended(backup, true);
        }).fail(error => {
            topMessage.html("Por el momento no tenemos recomendaciones");
            console.error("Request failed: " + error)
        });
    }

    function filtersRecommended () {
        const filter = $("#O")
        filter.on('change', function (e) {
            const option = e.target.value
            handleLoadRecommended(option);
        });
    }

    function renderRecommended (recommended, backup = false) {
        $.each(recommended, function (i, item) {
            recommendedContainer.append(`<li><div class="bc-shelf-item product-${item.productId}" data-productid="${item.productId}" data-category="${backup ? item.categories[0].split('/')[2] : getFieldValue(item, 'Categoría / Tipo de vehículo')}">
            <div class="bc-shelf-item__top"> 
              <a class="bc-shelf-item__img" href="${backup ? item.link : '#' }"><img class="img-responsive" src="${backup ? item.items[0].images[0].imageUrl : item.images[0].imageUrl}" /></a>
              <div class="d-flex flex-sb flex-acenter">
                <p class="bc-shelf-item__satus">${backup ? item["Condición"] : getFieldValue(item, 'Condición')}</p><i class="fenix-icon-heart js-add-to-wl"></i>
              </div>
            </div>
            <div class="bc-shelf-item__body"><a class="bc-shelf-item__name" href="${backup ? item.link : '#' }">${item.productName}</a>
              <div class="bc-shelf-item__specs d-flex">
                <div>${backup ? item["Modelo"] : getFieldValue(item, 'Modelo')}</div>
                <div>${backup ? item["KM"] : getFieldValue(item, 'KM')} Km</div>
                <div class="last">${backup ? item["Municipio"] : getFieldValue(item, 'Municipio')}</div> 
              </div><a class="bc-shelf-item__price" href="${backup ? item.link : '#' }">${backup ? _formatMoney(item.items[0].sellers[0].commertialOffer.Price) : _formatMoney(item.basePrice)}</a>
            </div>
            <div class="bc-shelf-item__foot"><button class="bc-btn-icon-ghost js-compare"><span>Comparar</span></button><a class="bc-btn-ghost" href="${backup ? item.link : '#' }">Conocer más</a></div>
            </div></li>`);
          });
        shelfFunctions.init({ slickShelf: false, imgCollections: false }); 
    }

    function getFieldValue (product, property) {
        const field = product.productSpecifications.filter((p) => p.fieldName === property);
        if (field.length && field[0].fieldValues.length) return field[0].fieldValues[0];
        return "";
    };

    return { init };
})();

$(document).ready(funcionalidadesRecomendados.init);
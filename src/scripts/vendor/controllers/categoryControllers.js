/* Dependences */
import { slug } from '../../global/helpers';

export function categoryControllers(customConfig) {
  var categoryData;
  var categoryPath = decodeURI(window.location.pathname.toLowerCase().replace("/", ""));
  var categoryLevels = categoryPath.split("/");
  var categoriesPathIds = "";
  var clusterId;
  var pageNumber = 1;
  var selectedPriceRanges = [];
  var brandList = {};
  var selectedBrand = [];
  var selectedFiltesrData = {};
  var selectedOrderOption = "";
  var searchContext;
  var pageQuantity;
  var brands = null;
  var firstLoad = true;

  /* Default Config */
  var config = {
    categoryTitle: null,
    childCategories: null,

    filters: null,
    specialFilters: {
      priceRanges: null,
      brand: null
    },

    selectorsClass: "customFilterSelectorCC",
    activeSelectorsClass: "active",
    disableClass: "disabled",
    notAvailableCombinations: true,

    addFiltersBtn: null,
    cleanFiltersBtn: null,

    shelf: null,

    filtersSummary: null,

    orderControls: null,
    order: null,

    pagination: {
      wraper: "<div></div>",
      previousBtnText: "Anterior",
      nextBtnText: "Siguiente",
      activeClass: "active",
      onlyBtnPage: false // Si es true se activa boton ver mas
    }
  };
  /*----------------*/

  var categoryServices = {
    categoryTree: function categoryTree() {
      var content = {
        url: "/api/catalog_system/pub/category/tree/" + categoryLevels.length,
        method: "GET",
        dataType: "json"
      };

      return $.ajax(content);
    },
    brandList: function brandList() {
      var content = {
        url: "/api/catalog_system/pub/brand/list",
        method: "GET",
        dataType: "json"
      };

      return $.ajax(content);
    }
  };

  var init = function init() {
    /* Asigna la configuración del usuario */
    $.extend(true, config, customConfig);

    /* Valida y aplica la configuracion responsive */
    if (config.responsive) {
      var deviceMatch = false;

      $.each(config.responsive, function (breakpoint, responsiveConfig) {
        if (parseInt(breakpoint) >= $(window).width() && !deviceMatch) {
          $.extend(true, config, responsiveConfig);
          deviceMatch = true;
        }
      });
    }

    /* Si se está en una landing, busca el ID de la colección elas clases del body */
    $("body")
      .attr("class")
      .split(" ")
      .forEach(function (val) {
        if (val.indexOf("H_") > -1) {
          clusterId = val.replace("H_", "");
        }
      });
    /* Valida el tipo de página en la que se estan renderizando los controladores */
    if (vtxctx.searchTerm || clusterId) {
      if (clusterId) {
        searchContext = "Landing";
      } else {
        if (vtxctx.searchTerm.toLowerCase() == "recomendados") {
          searchContext = 'Recomendados'
        } else {
          if (vtxctx.searchTerm.toLowerCase() == decodeURI(categoryPath)) {
            searchContext = "Search";
          } else {
            searchContext = "Search in Category";
          }
        }
      }
    } else {
      if (/^\d+$/.test(categoryLevels[categoryLevels.length - 1])) {
        searchContext = "Cluster in Category";
        clusterId = categoryLevels[categoryLevels.length - 1];
      } else {
        if (
          vtxctx.categoryName &&
          categoryLevels.length &&
          slug(categoryLevels[categoryLevels.length - 1]) == slug(vtxctx.categoryName)
        ) {
          searchContext = "Category";
        } else {
          if (categoryLevels.length == 1) {
            searchContext = "Brand";
          } else {
            searchContext = "Brand in Category";
          }
        }
      }
    }

    if (searchContext == "Brand" || searchContext == "Brand in Category") {
      var formatedBrandName = categoryLevels[categoryLevels.length - 1].replace(/\-/g, " ").toUpperCase();
      selectedBrand.push(formatedBrandName);
    }

    /* Si se está en una busqueda dentro de una categoria, se limpia el termio de busqueda de la URL */
    if (
      searchContext == "Search in Category" ||
      searchContext == "Cluster in Category" ||
      searchContext == "Brand in Category"
    ) {
      categoryPath = categoryPath.replace(/\/(?:.(?!\/))+$/, "");
      categoryLevels.splice(categoryLevels.length - 1, 1);
    }

    bringCategoryInfo("First Load");
  };

  /* Crea el map para la pagina de categoria */
  var categoryMap = function categoryMap(arrayCategories) {
    var mapHandlerString = "c";

    for (var i = 1; arrayCategories.length > i; i++) {
      mapHandlerString += ",c";
    }
    return mapHandlerString;
  };

  /* Trae la información de la categoria actual */
  function bringCategoryInfo(context) {
    var filtersValuesPath = "";
    var filtersIdsMap = "";
    var searchUrlBase;
    var mapHandler;

    /* Agrega los filtros seleccionados a la url */
    if (!$.isEmptyObject(selectedFiltesrData)) {
      $.each(selectedFiltesrData, function (filterId, selectedValues) {
        $.each(selectedValues, function (index, filterValue) {
          filtersValuesPath += "/" + encodeURIComponent(filterValue);
          filtersIdsMap += ",specificationFilter_" + filterId;
        });
      });
    }

    /* Agrega los filtros de precios seleccionados a la url */
    if (selectedPriceRanges.length) {
      $.each(selectedPriceRanges, function (index, selectedPriceRange) {
        filtersValuesPath += "/" + encodeURIComponent(selectedPriceRange);
        filtersIdsMap += ",priceFrom";
      });
    }

    /* Agrega los filtros de marca seleccionados a la url */
    if (selectedBrand.length && searchContext !== "Brand") {
      $.each(selectedBrand, function (index, selectedBrand) {
        filtersValuesPath += "/" + encodeURIComponent(selectedBrand);
        filtersIdsMap += ",b";
      });
    }

    switch (searchContext) {
      case 'Recomendados':
        searchUrlBase = "";
        mapHandler = '';
        break;
      case "Landing":
        searchUrlBase = clusterId;
        mapHandler = "productClusterIds";
        break;
      case "Search":
        searchUrlBase = vtxctx.searchTerm;
        mapHandler = "ft";
        break;
      case "Brand":
        searchUrlBase = categoryPath;
        mapHandler = "b";
        break;
      case "Brand in Category":
        searchUrlBase = categoryPath;
        mapHandler = categoryMap(categoryLevels);
        break;
      case "Search in Category":
        searchUrlBase = categoryPath + "/" + vtxctx.searchTerm;
        mapHandler = categoryMap(categoryLevels) + ",ft";
        break;
      case "Cluster in Category":
        searchUrlBase = categoryPath + "/" + clusterId;
        mapHandler = categoryMap(categoryLevels) + ",productClusterIds";
        break;
      case "Category":
        searchUrlBase = categoryPath;
        mapHandler = categoryMap(categoryLevels);
        break;
    }

    /* LLama los datos sobre la busqueda que se va a realizar */
    $.ajax({
      url:
        "/api/catalog_system/pub/facets/search/" +
        searchUrlBase +
        filtersValuesPath +
        "?map=" +
        mapHandler +
        filtersIdsMap,
      method: "get"
    }).then(function (categoryInfo) {
      categoryData = categoryInfo;
      window.categoryInfo = categoryData;

      var totalItems = 0;
      $.each(categoryData.Departments, function (index, departmentData) {
        totalItems += departmentData.Quantity;
      });

      /* Calcula la cantidad de paginas que tiene esta busqueda */
      if (config.shelf) {
        pageQuantity = Math.ceil(totalItems / config.shelf.itemsNumber);
      }

      if (context === "First Load") {
        if (
          searchContext == "Category" ||
          searchContext == "Search in Category" ||
          searchContext == "Cluster in Category" ||
          searchContext == "Brand in Category"
        ) {
          categoryServices.categoryTree().then(function (categoryTree) {
            categoriesIds(categoryTree);

            if (searchContext == "Brand in Category" || (config.specialFilters && config.specialFilters.brand)) {
              categoryServices.brandList().then(function (brands) {
                getBrandList(brands);
                firstLoadTasks();
              });
            } else {
              firstLoadTasks();
            }
          });
        } else if (searchContext == "Brand") {
          categoryServices
            .brandList()
            .then(function (brands) {
              getBrandList(brands);
              firstLoadTasks();
            })
            .fail(function () {
              console.warn("CATEGORY CONTROLLERS: Hubo un error al cargar el listado de marcas");
            });
        } else {
          firstLoadTasks();
        }
      } else if (context === "Reset Pagination Controls") {
        if (!config.pagination.onlyBtnPage) buildPaginationControls();
      } else if (config.notAvailableCombinations) {
        validateCategoryFiltered();
      }

      function firstLoadTasks() {
        validateConfig();
        loadSessionFilters();
      }
      if (!config.pagination.onlyBtnPage) buildPaginationControls();
    });
  }

  /* Llama el listado de las marcas para obtener sus IDs */
  function getBrandList(brands) {
    $.each(brands, function (index, brand) {
      if (brand.isActive) {
        var name = slug(brand.name).toUpperCase();
        brandList[name] = brand.id;
      }
    });
  }

  /* Valida si una combinacion de 2 o mas filtros tiene productos */
  function validateCategoryFiltered() {
    $(".customFilterCC ." + config.selectorsClass + ":not(.filtersSummarySelectorCC)").each(function () {
      var filterSelectorName = $(this).attr("data-filtervalue");
      var filterName = $(this)
        .parents(".customFilterCC")
        .attr("data-filtername");
      var availableCombination = false;
      var specificationFilters = categoryData.SpecificationFilters[filterName] || {};

      /* Valida si al combinar este filtro con el filtro ya seleccionado tendra productos relacionados */
      $.each(specificationFilters, function (specIndex, specData) {
        if (specData.Name == filterSelectorName) {
          availableCombination = true;
        }
      });

      /* Si el controlador esta configurado para mostrar/ocultar los selectores */
      if (config.notAvailableCombinations == "hide") {
        availableCombination ? $(this).show() : $(this).hide();

        /* Si el controlador esta configurado para activar/desactivar los selectores */
      } else if (config.notAvailableCombinations == "disable") {
        availableCombination
          ? $(this)
            .removeClass(config.disableClass + " unavailableCombinationCC")
            .css("pointer-events", "auto")
          : $(this)
            .addClass(config.disableClass + " unavailableCombinationCC")
            .css("pointer-events", "none");
      }
    });
  }

  /* Busca los Ids del path de la categoria actual */
  function categoriesIds(categoryTree) {
    var levelIndex = 0;
    getCategoryId(categoryTree);

    /* Busca el ID de cada uno de los niveles de categoria y crea el 'categoriesPathIds' */
    function getCategoryId(categoryLevel) {
      $.each(categoryLevel, function (categoryIndex, category) {
        if (categoryLevels[levelIndex] && slug(category.name) == slug(categoryLevels[levelIndex])) {
          levelIndex++;
          categoriesPathIds += "/" + category.id;

          if (levelIndex < categoryLevels.length) {
            repeat(getCategoryId, category.children);
          }
        }
      });
    }

    function repeat(callback, arrayToIterate) {
      callback(arrayToIterate);
    }
  }

  /* Valida la configuración del usuario */
  function validateConfig() {
    if (searchContext.indexOf("Category") >= 0) {
      if (config.filters) {
        buildFilters();
      } else {
        console.warn("CATEGORY CONTROLLERS: No hay configuración para los filtros de categoria.");
      }
      if (categoryData.PriceRanges && categoryData.PriceRanges.length) {
        if (config.specialFilters && config.specialFilters.priceRanges) {
          buildPriceRangeFilters();
        } else {
          console.warn("CATEGORY CONTROLLERS: No hay configuración para los rangos de precios.");
        }
      }
      if (searchContext != "Brand in Category") {
        if (categoryData.Brands.length) {
          if (config.specialFilters && config.specialFilters.brand) {
            buildBrandFilters();
          } else {
            console.warn("CATEGORY CONTROLLERS: No hay configuración para las marcas.");
          }
        }
      }
    } else {
      console.info(
        "CATEGORY CONTROLLERS: Los controles de filters solo estan disponibles para la página de categoria."
      );
    }

    if (config.childCategories) {
      buildCategoryNav();
    } else {
      console.warn("CATEGORY CONTROLLERS: No hay configuración para el menú de categorias (childCategories).");
    }

    if (config.orderControls) {
      config.orderControls.defaultOrder ? (selectedOrderOption = config.orderControls.defaultOrder) : "";
      buildOrderControls();
    } else {
      console.warn("CATEGORY CONTROLLERS: No hay configuración para los controles de orden.");
    }

    if (config.shelf) {
      waitingProducts("loadPage");
      if (config.pagination.path) {
        if (config.pagination.onlyBtnPage) buildPaginationControlsUnique();
        else buildPaginationControls();

        paginationControlsFun();
      } else {
        infiniteScroll();
      }
    } else {
      console.warn("CATEGORY CONTROLLERS: No hay configuración para la vitrina de productos.");
    }
  }

  /* Valida el estado del paginador */
  function validatePagination() {
    $('.paginationNumberCC[data-page="' + pageNumber + '"]').addClass(config.pagination.activeClass);

    if (pageNumber == 1) {
      $(".paginationPrevBtnCC").hide();
    } else {
      $(".paginationPrevBtnCC").show();
    }
    if (pageNumber == pageQuantity) {
      $(".paginationNextBtnCC, .paginationPlusBtnCC").hide();
    } else {
      $(".paginationNextBtnCC, .paginationPlusBtnCC").show();
    }
  }

  /* Construye los control de paginado unico */
  function buildPaginationControlsUnique() {
    if (pageQuantity > 1) {
      var control = $(config.pagination.wraper)
        .html(config.pagination.nextBtnText)
        .addClass("paginationPlusBtnCC paginationControlCC")[0].outerHTML;

      $(config.pagination.path).html(control);
      $(config.pagination.path).show();

      validatePagination();
      /* Si no, oculata el paginador */
    } else {
      $(config.pagination.path).hide();
    }
  }

  /* Construye los controles de paginado */
  function buildPaginationControls() {
    var paginationBegining = function paginationBegining() {
      return pageNumber == 1 ? 1 : pageNumber == 2 ? pageNumber - 1 : pageNumber - 2;
    };

    var paginationEnd = function paginationEnd() {
      return pageQuantity == pageNumber ? pageNumber : pageNumber == pageQuantity - 1 ? pageNumber + 1 : pageNumber + 2;
    };
    /* Si existe mas de una página, crea el paginador */
    if (pageQuantity > 1) {
      $(".pager .pageBtnsContainer").html("");

      var controls = $('<div class="paginationPrevBtnCC paginationControlCC"></div>')
        .html(config.pagination.previousBtnText)
        .css("display", "none")[0].outerHTML;

      if (paginationBegining() > 2) {
        controls += $(config.pagination.wraper)
          .html("1")
          .attr("data-page", "1")
          .addClass("paginationNumberCC paginationControlCC")[0].outerHTML;

        controls += $(config.pagination.wraper)
          .html("...")
          .addClass("paginationSeparator")[0].outerHTML;
      }

      for (var i = paginationBegining(); i <= paginationEnd(); i++) {
        var paginatinoNumberObj = $(config.pagination.wraper)
          .html(i)
          .attr("data-page", i)
          .addClass("paginationNumberCC paginationControlCC");
        controls += paginatinoNumberObj[0].outerHTML;
      }

      if (pageNumber < pageQuantity - 2) {
        controls += $(config.pagination.wraper)
          .html("...")
          .addClass("paginationSeparator")[0].outerHTML;

        controls += $(config.pagination.wraper)
          .html(pageQuantity)
          .attr("data-page", pageQuantity)
          .addClass("paginationNumberCC paginationControlCC")[0].outerHTML;
      }

      controls += $('<div class="paginationNextBtnCC paginationControlCC"></div>').html(
        config.pagination.nextBtnText
      )[0].outerHTML;

      $(config.pagination.path).html(controls);

      validatePagination();
      $(config.pagination.path).show();

      /* Si no, oculata el paginador */
    } else {
      $(config.pagination.path).hide();
    }
  }

  /* Construye el menú de subcategorias */
  function buildCategoryNav() {
    /* Inserta el titulo de la categoria o departamento */
    $(config.categoryTitle).html(vtxctx.categoryName);

    if (searchContext.indexOf("Category") >= 0) {
      getStartingLevel();
    } else {
      loopCategoryLvl(categoryData.CategoriesTrees, config.childCategories.path);
    }

    function getStartingLevel() {
      var lvlCounter = 0;
      enterLevel(categoryData.CategoriesTrees[0]);

      /* Busca la categoria inicial */
      function enterLevel(categoryLvl) {
        if (lvlCounter == categoryLevels.length - 1) {
          /* Si esta es la category actual, prosigue a procesar su información */
          $(document).trigger("categoryControllers:subcategory_Rendered", [categoryLvl]);
          loopCategoryLvl(categoryLvl.Children, config.childCategories.path);
        } else {
          lvlCounter++;

          /* Busca la categoria correspondiente en el este nivel */
          $.each(categoryLvl.Children, function (catIndex, catData) {
            if (slug(catData.Name) == categoryLevels[lvlCounter]) {
              /* Si la encuentra, repite todo el proceso con esta categoria */
              enterAgain(enterLevel, catData);
            }
          });
        }
      }

      function enterAgain(callback, childCategory) {
        callback(childCategory);
      }
    }

    /* Procesa la info de cada categoria */
    function loopCategoryLvl(categoryLvl, place) {
      var clusterMap = "";

      $.each(categoryLvl, function (catIndex, catData) {
        if (searchContext == "Landing") {
          var currentCategoryLevels = catData.Link.replace("/", "").split("/");
          clusterMap = "/" + clusterId + "?map=" + categoryMap(currentCategoryLevels) + ",productClusterIds";
        }

        var wraperHTML = $(
          "<" + config.childCategories.offspringWraper + "></" + config.childCategories.offspringWraper + ">"
        ).attr("data-categorypath", catData.Link);

        var itemName = config.childCategories.addLink
          ? '<a href="' + encodeURI(catData.Link) + clusterMap + '">' + catData.Name + "</a>"
          : catData.Name;

        var catInfoObj = $(config.childCategories.structure.replace(/\{{title}}/g, itemName)).attr(
          "data-categorypath",
          catData.Link
        );

        /* Si es la categoria principal, la imprime en el contenedor seleccionado */
        $(place).append(catInfoObj[0].outerHTML);

        /* Si esta categoria tiene descendencia, repite el proceso
      para esta */
        if (catData.Children.length) {
          $(place).append(wraperHTML[0].outerHTML);

          repeatCategoryLoop(
            catData.Children,
            config.childCategories.offspringWraper + '[data-categorypath="' + catData.Link + '"]',
            loopCategoryLvl
          );
        }
      });
    }

    function repeatCategoryLoop(categoryLvl, place, callback) {
      callback(categoryLvl, place);
    }
  }

  /* Construye los selectores de filtros */
  function buildFilters() {
    $.each(categoryData.SpecificationFilters, function (filterName, filterSelectors) {
      var filterConfig = config.filters[filterName];
      if (filterConfig) {
        var filterSelectorsHTML = "";
        var getFilterId = function getFilterId(url) {
          var selectorLinkParts = url.split("specificationFilter_");
          return selectorLinkParts[1];
        };

        if (filterConfig.order) {
          filterSelectors.sort(filterConfig.order);
        }

        /* Crea el HTML de cada selector */
        $.each(filterSelectors, function (selectorIndex, selector) {
          var selectorObj = $(filterConfig.selector.replace(/\{{name}}/g, selector.Name))
            .attr("data-filtervalue", selector.Name)
            .attr("data-filterid", getFilterId(selector.Link))
            .addClass(config.selectorsClass);

          filterSelectorsHTML += selectorObj[0].outerHTML;
        });

        /* Inserta el contenido de cada filtro en la estructura dada en la configuración */
        var buildedFilter = $(
          filterConfig.structure.replace(/\{{title}}/g, filterName).replace("{{selectors}}", filterSelectorsHTML)
        )
          .attr("data-filtername", filterName)
          .addClass("customFilterCC");

        $(filterConfig.path).append(buildedFilter[0].outerHTML);
      } else {
        console.warn("CATEGORY CONTROLLERS: No se ha configurado el filtro " + filterName);
      }
    });

    selectorsFun();
    filterControls();

    $(document).trigger("categoryControllers:filters_Rendered");
  }

  /* Construye los filtros de rango de precios */
  function buildPriceRangeFilters() {
    var priceRangeHTML = "";

    $.each(categoryData.PriceRanges, function (index, priceRange) {
      var priceRangeSelectorObj = $(config.specialFilters.priceRanges.selector.replace(/\{{name}}/g, priceRange.Name))
        .attr("data-pricerange", priceRange.Slug)
        .addClass("priceRangeSelectorCC");

      priceRangeHTML += priceRangeSelectorObj[0].outerHTML;
    });

    /* Inserta el contenido de cada filtro en la estructura dada en la configuración */
    var priceRangesBuild = $(
      config.specialFilters.priceRanges.structure.replace("{{selectors}}", priceRangeHTML)
    ).addClass("priceRangesContainerCC");

    $(config.specialFilters.priceRanges.path).append(priceRangesBuild);

    priceRangeFun();
  }

  /* Construye los filtros de marcas */
  function buildBrandFilters() {
    var priceRangeHTML = "";

    $.each(categoryData.Brands, function (index, brand) {
      var brandSelectorObj = $(config.specialFilters.brand.selector.replace(/\{{name}}/g, brand.Name))
        .attr("data-brand", brand.Name)
        .addClass("brandSelectorCC");

      priceRangeHTML += brandSelectorObj[0].outerHTML;
    });

    /* Inserta el contenido de cada filtro en la estructura dada en la configuración */
    var brandBuild = $(config.specialFilters.brand.structure.replace("{{selectors}}", priceRangeHTML)).addClass(
      "brandContainerCC"
    );

    $(config.specialFilters.brand.path).append(brandBuild);

    brandFun();
  }

  /* Construye los controles de ordenamiento de productos */
  function buildOrderControls() {
    /* Nombres por defecto de los controles de ordenamiento */
    var orderOptions = {
      OrderByNameASC: "Orden alfabético A - Z",
      OrderByNameDESC: "Orden alfabético Z - A",
      OrderByPriceASC: "Precio menor a mayor",
      OrderByPriceDESC: "Precio mayor a menor",
      OrderByTopSaleDESC: "Los mas vendidos",
      OrderByReleaseDateDESC: "Fecha de lanzamiento",
      OrderByBestDiscountDESC: "Mayor descuento"
    };

    /* Placeholder del selector*/
    // $(config.orderControls.path).append("<option value='' disabled selected>Ordenar por</option>");

    /* Crea e inserta cada control de ordenamiento */
    $.each(config.orderControls.list, function (optionValue, optionName) {
      var buildedControl = $(
        config.orderControls.structure.replace(
          /\{{name}}/g,
          optionName == true ? orderOptions[optionValue] : optionName
        )
      )
        .attr("data-ordervalue", optionValue)
        .addClass("orderOptionCC");

      $(config.orderControls.path).append(buildedControl);
    });

    orderControlsFun();

    $(document).trigger("categoryControllers:orderControls_Rendered");
  }

  /* Funcionamiento de los controles de paginado */
  function paginationControlsFun() {
    $(document).on("click", ".paginationNextBtnCC", function () {
      pageNumber++;
    });

    $(document).on("click", ".paginationPrevBtnCC", function () {
      pageNumber--;
    });

    $(document).on("click", ".paginationNumberCC", function (e) {
      if (!$(this).hasClass(config.pagination.activeClass)) {
        pageNumber = $(this).data("page");
      } else {
        e.stopImmediatePropagation();
      }
    });

    $(document).on("click", ".paginationControlCC", function () {
      if (!config.pagination.onlyBtnPage) {
        buildPaginationControls();
        waitingProducts("loadPage");
      }
    });

    $(document).on("click", ".paginationPlusBtnCC", function () {
      if (!$(config.shelf.path).attr("data-status")) {
        if (pageQuantity > pageNumber) {
          pageNumber++;
          waitingProducts("nextPage");
          validatePagination();
        }
      }
    });
  }

  /* Funcionalidad de los selectores de rango de precio */
  function priceRangeFun(context) {
    $((context ? context + " " : "") + ".priceRangeSelectorCC").click(function () {
      var priceRangeData = $(this).data("pricerange");

      $('.priceRangeSelectorCC[data-pricerange="' + priceRangeData + '"]').toggleClass(config.activeSelectorsClass);

      if (selectedPriceRanges.length) {
        $.each(selectedPriceRanges, function (index, priceRange) {
          priceRange == priceRangeData
            ? selectedPriceRanges.splice(index)
            : index == selectedPriceRanges.length - 1
              ? selectedPriceRanges.push(priceRangeData)
              : "";
        });
      } else {
        selectedPriceRanges.push(priceRangeData);
      }

      /* Si no está configurado el botón de Aplicar Filtros, aplica el filtro seleccionado */
      if (!config.addFiltersBtn) {
        pageNumber = 1;
        waitingProducts("filter");
      }
    });
  }

  /* Funcionalidad de los selectores de marca*/
  function brandFun(context) {
    $(document).on("click", (context ? context + " " : "") + ".brandSelectorCC", function () {
      var brandData = $(this).data("brand");

      $('.brandSelectorCC[data-brand="' + brandData + '"]').toggleClass(config.activeSelectorsClass);

      if (selectedBrand.length) {
        var index = selectedBrand.indexOf(brandData);
        if (index !== -1) selectedBrand.splice(index, 1);
        else selectedBrand.push(brandData);
      } else {
        selectedBrand.push(brandData);
      }

      /* Si no está configurado el botón de Aplicar Filtros, aplica el filtro seleccionado */
      if (!config.addFiltersBtn) {
        pageNumber = 1;
        waitingProducts("filter");
      }
    });
  }

  /* Funcionalidad de los controles de ordentamiento */
  function orderControlsFun() {
    /* Valida si los controles se renderizaron como un 'select' */
    if ($(config.orderControls.path).prop("tagName") == "SELECT") {
      $(config.orderControls.path).change(function () {
        selectedOrderOption = $(this)
          .find(":selected")
          .data("ordervalue");
        pageNumber = 1;
        waitingProducts("loadPage");
      });
    } else {
      $(".orderOptionCC").click(function () {
        $(this)
          .siblings(".orderOptionCC")
          .removeClass(config.orderControls.activeClass);

        if ($(this).hasClass(config.orderControls.activeClass)) {
          selectedOrderOption = "";
          $(this).removeClass(config.orderControls.activeClass);
        } else {
          selectedOrderOption = $(this).data("ordervalue");
          $(this).addClass(config.orderControls.activeClass);
        }
        pageNumber = 1;
        waitingProducts("loadPage");
      });
    }
  }

  /* Funcionalidad de los selectores de filtros */
  function selectorsFun(context) {
    $((context ? context + " " : "") + "." + config.selectorsClass).click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      var filterId = $(this).data("filterid");
      var filterValue = $(this).data("filtervalue");

      $(
        "." + config.selectorsClass + '[data-filterid="' + filterId + '"][data-filtervalue="' + filterValue + '"]'
      ).toggleClass(config.activeSelectorsClass);

      /* Agrega o elimina los datos del filtro */
      if (selectedFiltesrData[filterId]) {
        var existFilterIndex;

        $.grep(selectedFiltesrData[filterId], function (value, index) {
          if (value === filterValue) {
            existFilterIndex = index;
            return true;
          }
        });

        if (!isNaN(existFilterIndex)) {
          selectedFiltesrData[filterId].splice(existFilterIndex, 1);
        } else {
          selectedFiltesrData[filterId].push(filterValue);
        }
      } else {
        selectedFiltesrData[filterId] = [filterValue];
      }

      /* Si no está configurado el botón de Aplicar Filtros, aplica el filtro seleccionado */
      if (!config.addFiltersBtn) {
        pageNumber = 1;
        waitingProducts("filter");
      }
    });
  }

  /* Construye el resumen de filtros y rangos de precios */
  function buildFiltersSummary() {
    $(config.filtersSummary.path).html("");

    /* Filtros */
    $(".customFilterCC").each(function () {
      var filterActiveSelectors = $(this).find("." + config.selectorsClass + "." + config.activeSelectorsClass);
      var activeSelectorsVals = "";

      if (filterActiveSelectors.length) {
        filterActiveSelectors.each(function (index, value) {
          /* Si se configura un wraper para los selectores del resumen, lo aplica */
          if (config.filtersSummary.wrapper) {
            var activeSelectorObj = $(
              config.filtersSummary.wrapper.replace(/\{{value}}/g, $(this).data("filtervalue"))
            );

            /* Valida si los filtros estan configurados para aplicarse automaticamente. Si es asi,
        agrega los atributos necesarios para poder eliminar un filtro desde el resumen de filtros */
            if (!config.addFiltersBtn) {
              activeSelectorObj
                .attr("data-filterid", $(this).data("filterid"))
                .attr("data-filtervalue", $(this).data("filtervalue"))
                .addClass(config.selectorsClass + " " + config.activeSelectorsClass + " filtersSummarySelectorCC");
            }

            activeSelectorsVals += activeSelectorObj[0].outerHTML;
            /* Si no, los mete en un string separdos por comas */
          } else {
            activeSelectorsVals += (index == 0 ? "" : ", ") + $(this).data("filtervalue");
          }
        });

        var filterSummaryHTML = config.filtersSummary.structure
          .replace(/\{{title}}/g, $(this).data("filtername"))
          .replace(/\{{content}}/g, activeSelectorsVals);

        $(config.filtersSummary.path).append(filterSummaryHTML);
      }
    });

    /* Rangos de precios */
    $(".priceRangesContainerCC").each(function () {
      var priceRangeActiveSelectors = $(this).find(".priceRangeSelectorCC." + config.activeSelectorsClass);
      var activeSelectorsVals = "";

      if (priceRangeActiveSelectors.length) {
        priceRangeActiveSelectors.each(function (index, value) {
          /* Si se configura un wraper para los selectores del resumen, lo aplica */
          if (config.filtersSummary.wrapper) {
            var activeSelectorObj = $(config.filtersSummary.wrapper.replace(/\{{value}}/g, $(this).text()));

            /* Valida si los filtros estan configurados para aplicarse automaticamente. Si es asi,
        agrega los atributos necesarios para poder eliminar un filtro desde el resumen de filtros */
            if (!config.addFiltersBtn) {
              activeSelectorObj
                .attr("data-pricerange", $(this).data("pricerange"))
                .addClass("priceRangeSelectorCC " + config.activeSelectorsClass);
            }

            activeSelectorsVals += activeSelectorObj[0].outerHTML;
            /* Si no, los mete en un string separdos por comas */
          } else {
            activeSelectorsVals += (index == 0 ? "" : ", ") + $(this).text();
          }
        });

        var filterSummaryHTML = config.filtersSummary.structure
          .replace(/\{{title}}/g, "Rango de precios")
          .replace(/\{{content}}/g, activeSelectorsVals);

        $(config.filtersSummary.path).append(filterSummaryHTML);
      }
    });

    /* Marcas */
    $(".brandContainerCC").each(function () {
      var brandsActiveSelectors = $(this).find(".brandSelectorCC." + config.activeSelectorsClass);
      var activeSelectorsVals = "";

      if (brandsActiveSelectors.length) {
        brandsActiveSelectors.each(function (index, value) {
          /* Si se configura un wraper para los selectores del resumen, lo aplica */
          if (config.filtersSummary.wrapper) {
            var activeSelectorObj = $(config.filtersSummary.wrapper.replace(/\{{value}}/g, $(this).text()));

            /* Valida si los filtros estan configurados para aplicarse automaticamente. Si es asi,
          agrega los atributos necesarios para poder eliminar un filtro desde el resumen de filtros */
            if (!config.addFiltersBtn) {
              activeSelectorObj
                .attr("data-brand", $(this).data("brand"))
                .addClass("brandSelectorCC " + config.activeSelectorsClass);
            }

            activeSelectorsVals += activeSelectorObj[0].outerHTML;
            /* Si no, los mete en un string separdos por comas */
          } else {
            activeSelectorsVals += (index == 0 ? "" : ", ") + $(this).text();
          }
        });

        var filterSummaryHTML = config.filtersSummary.structure
          .replace(/\{{title}}/g, "Marcas")
          .replace(/\{{content}}/g, activeSelectorsVals);

        $(config.filtersSummary.path).append(filterSummaryHTML);
      }
    });

    /* Si el resumen de filtros tiene configurado un wraper y ademas los filtros estan configurados para aplicarse
    automaticamente, agrega la funcionalidad para eliminar un filtro desde el resumen de filtros */
    if (!config.addFiltersBtn && config.filtersSummary.wrapper) {
      selectorsFun(config.filtersSummary.path);
      if (firstLoad) {
        firstLoad = false;
        priceRangeFun(config.filtersSummary.path);
      }
      brandFun(config.filtersSummary.path);
    }
  }

  /* Controles para los filtros (Boton de aplicar y Limpiar Filtros) */
  function filterControls() {
    if (config.addFiltersBtn)
      $(config.addFiltersBtn).click(function () {
        if (!$.isEmptyObject(selectedFiltesrData)) {
          pageNumber = 1;
          waitingProducts("filter");
        }
      });

    if (config.cleanFiltersBtn)
      $(config.cleanFiltersBtn).click(function () {
        if (!$.isEmptyObject(selectedFiltesrData)) {
          selectedFiltesrData = {};

          pageNumber = 1;
          waitingProducts("filter");

          $("." + config.selectorsClass).removeClass(config.activeSelectorsClass);

          $(document).trigger("categoryControllers:clean_filters");
        }
      });
  }

  /* Deshabilita los filtros, mustra el mensaje 'Cargando' y oculta la vitrina mientras
    se cargan los productos, y revierte el proceso al finalizar */
  function waitingProducts(statusFlag) {
    var controlsAndFilters = function controlsAndFilters() {
      var buildedControl = "";

      config.addFiltersBtn ? (buildedControl += ", " + config.cleanFiltersBtn) : "";
      config.cleanFiltersBtn ? (buildedControl += ", " + config.cleanFiltersBtn) : "";
      config.orderControls && config.orderControls.path ? (buildedControl += ", " + config.orderControls.path) : "";
      config.filtersSummary && config.filtersSummary.path ? (buildedControl += ", " + config.filtersSummary.path) : "";
      config.pagination.path ? (buildedControl += ", " + config.pagination.path) : "";

      return $("." + config.selectorsClass + ":not(.unavailableCombinationCC)" + buildedControl);
    };

    switch (statusFlag) {
      case "filter":
        bringCategoryInfo();
      case "loadPage":
        toggleShelf("search", "start");
        break;

      case "nextPage":
        toggleShelf("scroll", "start");
        break;

      case "error":
        $(document).trigger("categoryControllers:search_Error");
      case "done":
        if ($(config.shelf.path).attr("data-status") == "Searching") {
          toggleShelf("search", "done");
        } else {
          toggleShelf("scroll", "done");
        }

        if (config.filtersSummary) {
          buildFiltersSummary();
        }
        $(document).trigger("categoryControllers:search_Done", [
          pageNumber,
          selectedFiltesrData,
          selectedPriceRanges,
          selectedBrand,
          selectedOrderOption
        ]);

        break;
    }

    function toggleShelf(context, status) {
      if (context == "scroll") {
        $(config.shelf.path).attr("data-status", "Waiting");
        toogleShelfStatus();
      } else {
        $(config.shelf.path).show(function () {
          $(config.shelf.path).attr("data-status", "Searching");
          status == "start" ? $(config.shelf.path).html("") : "";
          toogleShelfStatus();
        });
      }

      function toogleShelfStatus() {
        if (status == "start") {
          controlsAndFilters()
            .addClass(config.disableClass)
            .css("pointer-events", "none");
          bringProducts();
        } else {
          $(config.shelf.path).attr("data-status", "");
          controlsAndFilters()
            .removeClass(config.disableClass)
            .css("pointer-events", "auto");
        }
      }
    }
  }

  /* Llama el siguiente grupo de productos al hacer scroll */
  function infiniteScroll() {
    $(window).scroll(function () {
      var scrollPos = $(document).scrollTop();
      var shelfBottom = $(config.shelf.path).offset().top + $(config.shelf.path).height();
      var shelfPosition =
        shelfBottom > $(window).height() ? shelfBottom - $(window).height() : $(document).height() - $(window).height();

      /* Valida si se hace scroll hasta el final de la vitrina */

      if (scrollPos >= shelfPosition) {
        /* Previene que se repita la función antes de haber terminado de
      renderizar los productos llamados anteriormente */
        if (!$(config.shelf.path).attr("data-status")) {
          if (pageQuantity > pageNumber) {
            pageNumber++;
            waitingProducts("nextPage");
          }
        }
      }
    });
  }

  /* Hace el llamado de los productos */
  const bringProducts = async() => {
    !firstLoad && $(document).trigger('categoryControllers:search_Started', [pageNumber, selectedFiltersData, selectedBrand, selectedPriceRanges, selectedOrderOption]);
    saveCurrentFilters(pageNumber, selectedFiltesrData, selectedBrand, selectedPriceRanges, selectedOrderOption);

    function getFiltersUrl() {
      var filtersUrl = "";

      if (!$.isEmptyObject(selectedFiltesrData)) {
        $.each(selectedFiltesrData, function (filterId, selectedValues) {
          $.each(selectedValues, function (index, filterValue) {
            filtersUrl += "&fq=specificationFilter_" + filterId + ":" + encodeURIComponent(filterValue);
          });
        });
      } else if (queryParams['map']) {
        filtersUrl = queryParams['map'].split(',').every(a => a === 'c') ? '' : `&fq=${queryParams['map']}:${categoryPath}`
      }

      return filtersUrl;
    }

    function getPriceRangesUrl() {
      var priceRangesUrl = "";

      if (selectedPriceRanges.length) {
        $.each(selectedPriceRanges, function (index, selectedPriceRange) {
          var processedRange = "[" + selectedPriceRange.replace("de-", "").replace("-a-", "+TO+") + "]";
          priceRangesUrl += "&fq=P:" + processedRange;
        });
      }
      return priceRangesUrl;
    }

    function getBrandsUrl() {
      var brandsUrl = "";
      if (selectedBrand.length) {
        $.each(selectedBrand, function (index, selectedBrands) {
          var nameSelected = slug(selectedBrands).toUpperCase();
          var brandID = brandList[nameSelected];
          if (brandID) {
            brandsUrl += "&fq=B:" + encodeURIComponent(brandID);
          } else {
            console.warn("CATEGORY CONTROLLERS: No se ha encontrado el ID de marca " + selectedBrands);
          }
        });
      }
      return brandsUrl;
    }

    var searchUrlBase = '/api/catalog_system/pub/products/search?';

    switch (searchContext) {
      case 'Recomendados':
        searchUrlBase += '';
        break;
      case "Search":
        searchUrlBase = "ft=" + encodeURIComponent(vtxctx.searchTerm);
        break;
      case "Brand":
        searchUrlBase = getBrandsUrl();
        break;
      case "Brand in Category":
        searchUrlBase = "fq=C:" + categoriesPathIds.replace("/", "") + getBrandsUrl();
        break;
      case "Search in Category":
        searchUrlBase = "fq=C:" + categoriesPathIds.replace("/", "") + "&ft=" + encodeURIComponent(vtxctx.searchTerm);
        break;
      case "Cluster in Category":
        searchUrlBase = "fq=C:" + categoriesPathIds.replace("/", "") + "&fq=H:" + clusterId;
        break;
      case "Category":
        searchUrlBase = "fq=C:" + categoriesPathIds.replace("/", "");
        break;
    }

    $(document).trigger('searchUrlBase', searchUrlBase);

    var searchUrl =
      window.location.origin +
      "/buscapagina?" +
      searchUrlBase +
      "&PS=" +
      config.shelf.itemsNumber +
      "&sl=" +
      config.shelf.templateId +
      "&cc=" +
      config.shelf.itemsNumber +
      "&PageNumber=" +
      pageNumber +
      "&sm=0" +
      getFiltersUrl() +
      getBrandsUrl() +
      getPriceRangesUrl() +
      (selectedOrderOption ? "&O=" + selectedOrderOption : "");

    $.ajax({
      url: searchUrl
    })
      .then(function (rawProductsHtml) {
        if (!rawProductsHtml) {
          pageQuantity = pageNumber;
          waitingProducts("done");
        } else {
          renderProducts(rawProductsHtml);
        }

        $(document).trigger(
          "categoryControllers:all_Products_Loaded",
          $(rawProductsHtml).find("li[layout]:not(.helperComplement)").length
        );
      })
      .fail(function (errorInfo) {
        waitingProducts("error");
      });
  }

  /* Inserta los productos */
  function renderProducts(rawProductsHtml) {
    var products = $(rawProductsHtml).find("li[layout]:not(.helperComplement)");

    if (config.shelf.productWrapper) {
      products.each(function () {
        $(config.shelf.path).append($(config.shelf.productWrapper).append($(this).html()));
      });
    } else {
      products.each(function () {
        $(config.shelf.path).append($(this).html());
      });
    }

    waitingProducts("done");
  }

  function loadSessionFilters() {
    var categoryFilters = loadFilters();

    if (!categoryFilters.filtersLoaded) {
      return;
    }

    pageNumber = categoryFilters.pageNumber || 1;
    selectedFiltesrData = categoryFilters.selectedFiltersData || {};
    selectedPriceRanges = categoryFilters.selectedPriceRanges || [];
    selectedBrand = categoryFilters.selectedBrand || [];
    selectedOrderOption = categoryFilters.selectedOrderOption || "";

    applyPageNumber();
    applyPageNumber();
    applySelectedFiltersData();
    applySelectedPriceRanges();
    applySelectedBrand();
    applySelectedOrderOption();

    bringCategoryInfo("Reset Pagination Controls");
  }

  function applyPageNumber() { }

  function applySelectedFiltersData() {
    Object.keys(selectedFiltesrData).forEach(function (filterID) {
      var filterValues = selectedFiltesrData[filterID];
      filterValues.forEach(function (filterValue) {
        var filter = $("[data-filterid='" + filterID + "']").filter("[data-filtervalue='" + filterValue + "']");
        filter.addClass(config.activeSelectorsClass);
      });
    });
  }

  function applySelectedPriceRanges() {
    selectedPriceRanges.forEach(function (priceRange) {
      $("[data-pricerange='" + priceRange + "']").addClass(config.activeSelectorsClass);
    });
  }

  function applySelectedBrand() {
    selectedBrand.forEach(function (brand) {
      $("[data-brand='" + brand + "']").addClass(config.activeSelectorsClass);
    });
  }

  function applySelectedOrderOption() {
    if (!selectedOrderOption) {
      return;
    }
    $(config.orderControls.path)
      .find("[data-ordervalue='" + selectedOrderOption + "']")
      .prop("selected", true);
  }

  function saveCurrentFilters(
    pageNumber,
    selectedFiltersData,
    selectedBrand,
    selectedPriceRanges,
    selectedOrderOption
  ) {
    var categoryFilters = loadFilters();

    categoryFilters.pageNumber = pageNumber;
    categoryFilters.selectedFiltersData = selectedFiltersData;
    categoryFilters.selectedBrand = selectedBrand;
    categoryFilters.selectedPriceRanges = selectedPriceRanges;
    categoryFilters.selectedOrderOption = selectedOrderOption;

    sessionStorage.categoryFilters = JSON.stringify(categoryFilters);
  }

  function loadFilters() {
    var filtersLoaded = true;
    var categoryFilters = sessionStorage.getItem("categoryFilters");

    if (categoryFilters) {
      try {
        categoryFilters = JSON.parse(categoryFilters);
      } catch (err) {
        categoryFilters = {};
        filtersLoaded = false;
      }
    } else {
      categoryFilters = {};
      filtersLoaded = false;
    }

    if (!categoryFilters.categoryPathName) {
      categoryFilters.categoryPathName = window.location.pathname;
    }

    if (categoryFilters.categoryPathName !== window.location.pathname) {
      categoryFilters = {};
      categoryFilters.categoryPathName = window.location.pathname;
      sessionStorage.removeItem("categoryFilters");
      filtersLoaded = false;
    }

    categoryFilters.filtersLoaded = filtersLoaded;

    return categoryFilters;
  }

  return init();
};

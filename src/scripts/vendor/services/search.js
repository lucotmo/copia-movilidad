import fetch from "unfetch";
import { FILTERS_DEFAULTS, VTEX_STOREID_FIELD } from "../../global/constants";
import { storeID } from "../../global/helpers";

const SearchFunctions = (() => {
  const fetchMDFilter = (entityName, onSuccess, onError) => {
      fetch(`/api/dataentities/${entityName}/search?activo=true&_fields=nombre,activo,id`, {
          headers: { "REST-Range": "resources=0-100" },
      })
          .then((res) => res.json())
          .then((filters) => {
              onSuccess(filters);
          })
          .catch((err) => {
              onError(err);
          });
  };

  const fetchFilters = (onSuccess, onError) => {
    Promise.all(
      ["19", "21", "26", "27"].map((filterId) =>
        fetch(`/api/catalog_system/pub/specification/fieldvalue/${filterId}`).then((res) => res.json())
      )
    )
      .then((res) => {
        let filters = {};
        const filtersMap = {
          0: "Condición",
          1: "Placa",
          2: "Transmisión",
          3: "Combustible"
        };
        res.forEach((filterArray, index) => {
          filters[filtersMap[index]] = !filterArray.length
            ? []
            : filterArray.filter((filterValue) => filterValue.IsActive).map((filterValue) => filterValue.Value);
        });
        onSuccess(filters);
      })
      .catch((err) => onError(err));
  };

  const searchFilterInArr = (filterId, filters) => filters.filter((filter) => filter.id === filterId)[0];

  const assignFilterSpec = (spec) => {
    switch (spec) {
      case "Cilindraje":
        return '28';
      case "Combustible":
        return '27';
      case "Condición":
        return '19';
      case "Línea":
        return '88';
      case "Marca":
        return '22';
      case "Placa":
        return '21';
      case "Transmisión":
        return '26';
      case "Ubicación":
        return '20';
    }
  }

  const doAdvancedSearch = (filters) => {
    const url = new URL(window.location.href);

    const _storeID = storeID.getStoreID();
        
    const currentPage = url.href.includes('store') 
        ? "store" 
        : "busca" 

    const inStoreSearch = `specificationFilter_91:${_storeID},`

    const selectedTypes = searchFilterInArr("selectedTypes", filters),
      modelValues = searchFilterInArr("modelValues", filters),
      mileageValue = searchFilterInArr("mileageValue", filters),
      priceValues = searchFilterInArr("priceValues", filters),
      priceLimits = searchFilterInArr("priceLimits", filters),
      selectedFilters = searchFilterInArr("selectedFilters", filters),
      addOns = searchFilterInArr("addOns", filters),
      airBags = searchFilterInArr("airBags", filters);

    let searchURL = priceValues
      ? `/${currentPage}/?fq=P:[${priceValues.values[0]}+TO+${priceValues.values[1]}],${
        currentPage === "store" ? inStoreSearch : ""
      }`
      : `/${currentPage}/?fq=P:[${FILTERS_DEFAULTS.price[0]}+TO+${FILTERS_DEFAULTS.price[1]}],${
        currentPage === "store" ? inStoreSearch : ""
      }`;

    const canAddSeparator = (index, arrLength) =>
      index + 1 <= arrLength && searchURL !== "/busca/?fq=" && !searchURL.endsWith(",");

    if (selectedTypes && selectedTypes.values)
      selectedTypes.values.forEach((type, i) => {
        searchURL += `specificationFilter_24:${type.text}`;
        if (canAddSeparator(i, selectedTypes.values.length)) searchURL += ",";
      });

    if (selectedFilters && selectedFilters.values) {
      const filtersMap = ["28", "27", "19", "88", "22", "21", "26", "20"];

      selectedFilters.values.forEach((filter, i) => {

        const key = Object.keys(filter)[0];
        if (!!filter[key]) {

          let specFilterNo = assignFilterSpec(key)

          if (key === "Cilindraje") { // FilterID 28: "Cilindraje"
              let range = filter[key].replace(/\s|-/g, "");
              range = range && range.split("cc", 2);
              range = range && range.length && range.map((val) => parseInt(val));

              if (range[0] && range[1]) {
                  for (let j = range[0]; j <= range[1]; j += 100) {
                      searchURL += `specificationFilter_${specFilterNo}:${j}`;
                      if (range[0] < j < range[1]) searchURL += ",";
                  }
              }
          } else searchURL += `specificationFilter_${specFilterNo}:${filter[key].replace(/\s/g, '%20')}`;
        }
        if (canAddSeparator(i, selectedFilters.values.length)) {
          searchURL += ",";
        }
      });
    }

    if (modelValues && modelValues.values) {
      for (let i = modelValues.values[0]; i <= modelValues.values[1]; i++) {
        searchURL += `specificationFilter_23:${i}`;
        if (canAddSeparator(i, modelValues.values[1]) || i === modelValues.values[1]) searchURL += ",";
      }
    }

    if (addOns && addOns.values) {
      const addOnsMap = {
        "Aire acondicionado": "32",
        "Frenos ABS": "30",
        "Alarma": "34",
        "Keyless Access": "81",
        "Bloqueo central": "35",
        "Vidrios eléctricos": "33",
      };

      addOns.values.forEach((addOn, i) => {
        searchURL += `specificationFilter_${addOnsMap[addOn]}:SI`;
        if (canAddSeparator(i, addOns.values.length)) searchURL += ",";
      });
    }

    if (mileageValue && mileageValue.values) {
      let i = 0;
      while (i < mileageValue.values[0]) {
        searchURL += `specificationFilter_89:${i}-${i + FILTERS_DEFAULTS.mileageStep}`;

        if (i + FILTERS_DEFAULTS.mileageStep <= mileageValue.values[0]) searchURL += ",";
        i += FILTERS_DEFAULTS.mileageStep;
      }
    }

    if (airBags && airBags.values) {
      searchURL += `specificationFilter_31:${airBags.values}`;
    }

    window.location.href = searchURL;
  };

  return { fetchMDFilter, fetchFilters, doAdvancedSearch };
})();

export default SearchFunctions;

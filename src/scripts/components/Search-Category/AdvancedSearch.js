import fetch from "unfetch";
import { h, Component, createRef } from "preact";

import BCTypeSelect from "./TypeSelect";
import BCStickyFiltersMovil from "./StickyFiltersMovil";
import BCSlider from "../Slider/Slider";
import BCRange from "../Slider/Range";

import SearchFunctions from "../../vendor/services/search";
import { handleCheckboxElements } from "../../base/forms";
import { FILTERS_DEFAULTS, VEHICLE_TYPES, SC_API_URL, MK_ID } from "../../global/constants";
import { _formatMoney, _formatNumber } from "../../global/helpers";

function slugify(str) {
  var map = {
    a: "á|à|ã|â|À|Á|Ã|Â",
    e: "é|è|ê|É|È|Ê",
    i: "í|ì|î|Í|Ì|Î",
    o: "ó|ò|ô|õ|Ó|Ò|Ô|Õ",
    u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
    c: "ç|Ç",
    n: "ñ|Ñ",
  };
  str = str.toLowerCase();
  for (var pattern in map) {
    str = str.replace(new RegExp(map[pattern], "g"), pattern);
  }
  return str;
}

export default class BCAdvancedSearchCategory extends Component {
  typeRef = createRef();
  brandRef = createRef();
  lineRef = createRef();
  locationRef = createRef();
  fuelRef = createRef();
  displacementRef = createRef();
  transmissionRef = createRef();
  plateRef = createRef();
  stateRef = createRef();
  mobStateRef = createRef();
  addOnsRef = createRef();

  addOns = ["Aire acondicionado", "Frenos ABS", "Vidrios eléctricos", "Alarmas", "Keyless Access", "Bloqueo central",];
  typePreviewClass = "js-type-preview";

  filtersInitialState = {
    selectedTypes: [],
    selectedTypesBackUp: [],
    priceValues: FILTERS_DEFAULTS.price,
    modelValues: FILTERS_DEFAULTS.model,
    mileageValue: FILTERS_DEFAULTS.mileage[1],
    airBags: 0,
    selectedFilters: {
      Cilindraje: "",
      Combustible: "",
      Condición: "",
      Marca: "",
      Ubicación: "",
      Transmisión: "",
      Placa: "",
      Línea: "",
      Condición: "",
    },
    addOns: [],
  };

  constructor(props) {
    super(props);

    if (props.priceLimits) {
      this.filtersInitialState.priceValues = props.priceLimits;
      this.filtersInitialState.priceLimits = props.priceLimits;
    }
    if (props.modelLimits) {
      this.filtersInitialState.modelValues = props.modelLimits;
      this.filtersInitialState.modelLimits = props.modelLimits;
    }

    this.state = {
      ...this.filtersInitialState,
      hasChangeCheckbox: false,
      brands: props.brands,
      filters: {
        Condición: [],
        Ubicación: [],
        Placa: [],
        Transmisión: [],
        Combustible: [],
        Cilindraje: [],
        Línea: [],
      },
      typePreview: {
        isVisible: false,
        title: "",
        image: "",
      },
      Línea: []
    };
    // Filtros Aplicados en el componente
    var preFilter = JSON.parse(localStorage.getItem("StateSeach"));
    if (!!preFilter && Object.keys(preFilter).length > 0) {
      if (preFilter.filters != undefined) {
        this.state = preFilter;
        let selecteds = [];

        if (preFilter.addOns) {
          preFilter.addOns.forEach((select) => {
            $("#addOnsRef label:contains('" + select + "')")
              .parent()
              .find("input")
              .prop("checked", true);
          });
        }

        this.state.selectedTypesBackUp = preFilter.selectedTypesBackUp;

      } else {
        preFilter.priceValues
          ? (this.state.priceValues = preFilter.priceValues)
          : (this.state.priceValues = this.filtersInitialState.priceValues);

        localStorage.setItem("StateSeach", JSON.stringify(this.state));
      }
    }
  }

  componentDidMount() {
    SearchFunctions.fetchFilters(
      (newFilters) => this.setState((prevState) => ({ filters: { ...prevState.filters, ...newFilters } })),
      (err) => console.warn("Error on get filters", err)
    );
    fetch(`/api/dataentities/CD/search?_fields=minValue,maxValue,id&activo=true&_sort=minValue ASC`, {
      headers: { "REST-Range": "resources=0-100" },
    })
      .then((res) => res.json())
      .then((data) => {
        const Cilindraje = data.map(cilRange => `${cilRange.minValue}cc - ${cilRange.maxValue}cc`);
        this.setState((prevState) => ({ filters: { ...prevState.filters, Cilindraje } }));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    this.citiesServiceFunc();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.priceLimits !== prevProps.priceLimits) {
      this.filtersInitialState.priceValues = props.priceLimits;
    }
    if (this.props.modelLimits !== prevProps.modelLimits) {
      this.filtersInitialState.modelValues = props.modelLimits;
    }
    if (this.state.filters.Condición !== prevState.filters.Condición) {
      this.handlePreviewType();
      handleCheckboxElements();
    }
  }

  citiesServiceFunc = () => {

    fetch(`${SC_API_URL}/product/api/location/v1/cities/${MK_ID}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        data = data?.map(item => {
          return {
            location: item.name
          }
        });
        this.setState(({ filters }) => ({ filters: { ...filters, Ubicación: data } }))
      });
  };

  componentDidCatch(err) {
    console.log(err);
  }

  getLinesForBrand(brand) {
    fetch(`/api/dataentities/LN/search?_fields=nombre,activo,id&idMarca=${brand}`, {
      headers: { "REST-Range": "resources=0-100" },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ Línea: data });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  toggleSearchMode = (e) => {
    localStorage.setItem("StateSeach", JSON.stringify(this.state));
    this.setState((prevState) => ({ isAdvancedMode: !prevState.isAdvancedMode }));
    e && e.preventDefault();
  };

  // Se encarga de los estilos cuando esta selected
  toggleSelectState = (Ref) => {
    const currentActive = $(".bc-select--active");

    if (currentActive.length && !currentActive.is(Ref)) currentActive.removeClass("bc-select--active");
    $(Ref).toggleClass("bc-select--active");
  };

  resolveSelectedTypes = () => {
    const { selectedTypesBackUp } = this.state;

    if (!selectedTypesBackUp.length || selectedTypesBackUp.length === VEHICLE_TYPES.length) return "Todos";
    else return selectedTypesBackUp.map((type, i) => (i + 1 < selectedTypesBackUp.length ? `${type.text}, ` : type.text));
  };

  searchTypesSelected = () => {
    const typeSelect = $(this.typeRef.current);
    let _selectedTypes = [];

    typeSelect.find("input:checked").each(function (_, element) {
      const text = typeSelect.find(`label[for="${element.name}"]`).text();
      _selectedTypes.push({ value: element.name.replace("op-", ""), text });
    });
    return _selectedTypes;
  };

  handlePreviewType = () => {
    const showPreview = (typeName) => {
      let typeSelected = VEHICLE_TYPES.filter((type) => type.name === typeName)[0];
      this.setState({ typePreview: { isVisible: true, title: typeSelected.label, image: typeSelected.image } });
    };

    const hidePreview = () => {
      this.setState({ typePreview: { isVisible: false, title: "", image: "" } });
    };

    $(`.${this.typePreviewClass}`).hover(function () {
      const typeName = $(this).parent().find("input").attr("name");

      showPreview(typeName);
    }, hidePreview);
  };

  handleApplyTypeSelect = (e) => {
    this.toggleSelectState(this.typeRef.current);
    this.setState({ selectedTypesBackUp: this.searchTypesSelected() });
    e && e.preventDefault();
  };

  handleChangeSlider = (sliderName, value) => {
    this.setState({ [sliderName]: value });
  };

  handleChangeAirBags = (e) => {
    const { airBags } = this.state,
      operations = {
        less: () => (airBags > 0 ? airBags - 1 : airBags),
        add: () => (airBags < 5 ? airBags + 1 : airBags),
      },
      newValue = operations[$(e.target).data("operation")]();

    this.setState({ airBags: newValue });
  };

  handleSelectOption = (selectRef, option) => {
    const filterName = $(selectRef).data("filter");
    const optionHTML = $(option).html();
    const value = optionHTML !== "Todas" && optionHTML !== "Todos" ? optionHTML : "";

    if (filterName === "Marca") {
      if (!value) {
        this.setState((prevState) => ({ selectedFilters: { ...prevState.selectedFilters, Marca: "", Línea: "" } }));
      }
      else {
        this.setState((prevState) => ({ selectedFilters: { ...prevState.selectedFilters, [filterName]: value } }));
      }
    } else if (filterName === "Condición") {
      if (value === "Nuevo") {
        const currentYear = new Date().getFullYear();
        this.setState((prevState) => ({ modelValues: [currentYear - 1, currentYear], selectedFilters: { ...prevState.selectedFilters, [filterName]: value } }));
      } else {
        this.setState((prevState) => ({ selectedFilters: { ...prevState.selectedFilters, [filterName]: value } }));
      }
    } else {
      this.setState((prevState) => ({ selectedFilters: { ...prevState.selectedFilters, [filterName]: value } }));
    }

    this.toggleSelectState(selectRef);
  };

  updateCheckboxes = (addOn) => {
    const foundAddOn = this.state.addOns.find((el) => el === addOn);
    if (!!foundAddOn) {
      const updatedAddOns = this.state.addOns.filter((el) => el !== addOn);
      this.setState({ addOns: updatedAddOns });
    } else {
      const newAddOns = [...this.state.addOns, addOn]
      this.setState({ addOns: newAddOns });
    }
  };

  buildSelectedFilters = (isSearch) => {
    const { selectedFilters, selectedTypes, selectedTypesBackUp, modelValues, priceValues, mileageValue, addOns } = this.state;
    let filters = [];

    /* Type and sliders */
    if (selectedTypes?.length) {
      filters.push({ id: "selectedTypes", values: selectedTypes });
    } else if (selectedTypesBackUp.length) {
      filters.push({ id: "selectedTypes", values: selectedTypesBackUp });
    }
    if (modelValues.toString() !== this.state.modelLimits.toString()) {
      filters.push({ id: "modelValues", values: modelValues, isSlider: true });
    }
    if (mileageValue !== FILTERS_DEFAULTS.mileage[1]) {
      filters.push({ id: "mileageValue", values: [mileageValue], format: _formatNumber });
    }
    if (priceValues !== this.filtersInitialState.priceValues) {
      filters.push({ id: "priceValues", values: priceValues, isSlider: true, format: _formatMoney });
    }

    /* Select filters */
    let _selectedFilters = [];
    Object.keys(selectedFilters)
      .sort()
      .forEach((filter) => {
        if (selectedFilters[filter]) _selectedFilters.push({ [filter]: selectedFilters[filter] });
        else if (isSearch) _selectedFilters.push({ [filter]: selectedFilters[filter] });
      });

    if (_selectedFilters.length) filters.push({ id: "selectedFilters", values: _selectedFilters });

    /* Checkboxes */

    if (addOns.length) filters.push({ id: "addOns", values: addOns });

    const state = $(this.mobStateRef.current);
    let selectedState = [];

    state.find("input:checked").each(function (_, element) {
      const option = state.find(`label[for="${element.name}"]`).text();
      selectedState.push(option);
    });

    if (selectedState.length) filters.push({ id: "state", values: selectedState });

    return filters;
  };

  handleRemoveFilter = (filterId, value) => {
    /* Checkboxes */
    if (filterId === "addOns" || filterId === "state" || filterId === "selectedTypes") {
      const checkSelectorMap = {
        addOns: $(this.addOnsRef.current),
        state: $(this.mobStateRef.current),
        selectedTypes: $(this.typeRef.current),
      };
      const checkSelector = checkSelectorMap[filterId];

      checkSelector.find("input:checked").each(function (_, element) {
        if (checkSelector.find(`label[for="${element.name}"]`).text() === value) element.checked = false;
      });

      if (filterId === "selectedTypes") {
        this.setState((prevState) => ({ selectedTypesBackUp: prevState.selectedTypesBackUp.filter((type) => type !== value) }));
      } else this.updateCheckboxes();
    }

    /* Sliders */
    if (filterId === "mileageValue" || filterId === "modelValues" || filterId === "priceValues") {
      const defaultMap = {
        mileageValue: this.filtersInitialState.mileageValue,
        modelValues: this.filtersInitialState.modelValues,
        priceValues: this.filtersInitialState.priceValues,
      };
      this.setState({ [filterId]: defaultMap[filterId] });
    }

    /* Select filters */
    if (filterId === "selectedFilters") {
      this.setState((prevState) => {
        const selectedFilters = prevState.selectedFilters;
        let newSelectedFilters = {};

        Object.keys(selectedFilters).forEach((filter) => {
          if (selectedFilters[filter] !== value) newSelectedFilters[filter] = selectedFilters[filter];
          else newSelectedFilters[filter] = "";
        });

        return { selectedFilters: newSelectedFilters };
      });
    }
    localStorage.setItem("StateSeach", JSON.stringify(this.state));
  };

  handleSearch = () => {
    const { airBags, selectedTypesBackUp, selectedTypes } = this.state;
    const filters = this.buildSelectedFilters(true);

    if (airBags) filters.push({ id: "airBags", values: airBags });

    if (window.screen.width >= 1024 && (!selectedTypes?.length || !selectedTypesBackUp?.length)) {
      const _selectedTypes = this.searchTypesSelected();
      _selectedTypes.length && filters.push({ id: "selectedTypes", values: _selectedTypes });
    }
    localStorage.setItem("StateSeach", JSON.stringify(this.state));
    SearchFunctions.doAdvancedSearch(filters);
  };

  handleCleanFilters = (e) => {
    $("input.bc-checkbox__input").prop("checked", false);
    $("input.bc-checkbox__input").removeAttr("checked");
    $(".bc-checkbox-type").removeClass("bc-checkbox--active");

    $(".bc-search-modal-lg")
      .find("input:checked")
      .each(function (_, element) {
        element.checked = false;
      });
    this.setState({ ...this.filtersInitialState });
    localStorage.setItem("StateSeach", JSON.stringify(this.state));
    e && e.preventDefault();
  };

  render(props, state) {
    const { onClose, modelLimits, priceLimits } = props;
    const { brands, priceValues, modelValues, mileageValue, airBags, filters, selectedFilters, selectedTypesBackUp, addOns } = state;

    return (
      <div className="container">
        <BCStickyFiltersMovil
          baseButtonRef=".js-search-btn"
          filters={this.buildSelectedFilters()}
          onRemoveFilter={this.handleRemoveFilter}
          onSearch={this.handleSearch}
          onCleanFilters={this.handleCleanFilters}
        />

        <div className="bc-search m-bottom-4">
          <div className="row no-gutters guttered">
            <div className="col-11 col-lg-3 m-right-auto m-left-auto order-1 filter-group">
              <BCRange
                label="Precio"
                onChange={(value) => this.handleChangeSlider("priceValues", value)}
                value={priceValues}
                limits={priceLimits || FILTERS_DEFAULTS.price}
                step={FILTERS_DEFAULTS.priceStep}
              />
            </div>

            <div className="col-lg-3 col-12 category-container order-2 filter-group TpeSlect">
              <BCTypeSelect
                _ref={this.typeRef}
                values={this.resolveSelectedTypes()}
                previeBtnClass={this.typePreviewClass}
                onOpen={() => this.toggleSelectState(this.typeRef.current)}
                onApply={this.handleApplyTypeSelect}
                selectedTypes={selectedTypesBackUp}
              />
            </div>

            <div className="col-6 col-lg-3 order-3 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.brandRef} data-filter="Marca">
                  <label className="bc-select__label">Marca</label>

                  <div className="bc-select__input" onClick={() => this.toggleSelectState(this.brandRef.current)}>
                    <p>{selectedFilters.Marca || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>

                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.brandRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="bc-select__option col-12"
                        onClick={(e) => { this.handleSelectOption(this.brandRef.current, e.target); this.getLinesForBrand(brand.id) }}
                      >
                        {brand.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 order-5 filter-group">
              <div className="bc-select__wrapper">
                <div
                  className={`bc-select ${!selectedFilters.Marca ? "bc-select--disabled" : ""}`}
                  ref={this.lineRef}
                  data-filter="Línea"
                >
                  <label className="bc-select__label">Línea</label>
                  <div
                    className="bc-select__input"
                    onClick={() => selectedFilters.Marca && this.toggleSelectState(this.lineRef.current)}
                  >
                    <p>{selectedFilters.Línea || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.lineRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {this.state.Línea.length > 0 && this.state.Línea.map((line) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.lineRef.current, e.target)}
                      >
                        {line.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 order-6 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.locationRef} data-filter="Ubicación">
                  <label className="bc-select__label">Ubicación</label>
                  <div className="bc-select__input" onClick={() => this.toggleSelectState(this.locationRef.current)}>
                    <p>{selectedFilters.Ubicación || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.locationRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {filters.Ubicación && filters.Ubicación.map((location) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.locationRef.current, e.target)}
                      >
                        {location.location}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 order-7 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.fuelRef} data-filter="Combustible">
                  <label className="bc-select__label">Combustible</label>
                  <div className="bc-select__input" onClick={() => this.toggleSelectState(this.fuelRef.current)}>
                    <p>{selectedFilters.Combustible || "Todos"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.fuelRef.current, e.target)}
                    >
                      Todos
                      </div>
                    {filters.Combustible.map((fuel) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.fuelRef.current, e.target)}
                      >
                        {fuel}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 order-8 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.displacementRef} data-filter="Cilindraje">
                  <label className="bc-select__label">Cilindraje</label>
                  <div
                    className="bc-select__input"
                    onClick={() => this.toggleSelectState(this.displacementRef.current)}
                  >
                    <p>{selectedFilters.Cilindraje || "Todos"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.displacementRef.current, e.target)}
                    >
                      Todos
                      </div>
                    {filters.Cilindraje && filters.Cilindraje.map((displacement) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.displacementRef.current, e.target)}
                      >
                        {displacement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="col-3 visible-lg visible-md order-6-lg order-9 filter-group"> */}
            <div className="col-6 col-lg-3 order-6-lg order-9 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.stateRef} data-filter="Condición">
                  <label className="bc-select__label">Condición</label>
                  <div className="bc-select__input" onClick={() => this.toggleSelectState(this.stateRef.current)}>
                    <p>{selectedFilters.Condición || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.stateRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {filters.Condición.map((state) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.stateRef.current, e.target)}
                      >
                        {state}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-11 col-lg-3 m-right-auto m-left-auto order-10 filter-group">
              <BCRange
                label="Modelo"
                value={modelValues}
                limits={modelLimits || FILTERS_DEFAULTS.model}
                noFormat
                onChange={(value) => this.handleChangeSlider("modelValues", value)}
              />
            </div>

            <div className="col-11 col-lg-3 m-right-auto m-left-auto order-11 filter-group">
              <BCSlider
                label="Kilometraje"
                suffix="km"
                preffix="Hasta"
                value={mileageValue}
                limits={FILTERS_DEFAULTS.mileage}
                step={FILTERS_DEFAULTS.mileageStep}
                isNumeric
                onChange={(value) => this.handleChangeSlider("mileageValue", value)}
                disabled={selectedFilters.Condición === 'Nuevo' ? true : false}
              />
            </div>

            <div className="col-6 col-lg-3 order-12 filter-group">
              <div className="bc-select__wrapper">
                <div className="bc-select" ref={this.transmissionRef} data-filter="Transmisión">
                  <label className="bc-select__label">Transmisión</label>
                  <div
                    className="bc-select__input"
                    onClick={() => this.toggleSelectState(this.transmissionRef.current)}
                  >
                    <p>{selectedFilters.Transmisión || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.transmissionRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {filters.Transmisión.map((transmission) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.transmissionRef.current, e.target)}
                      >
                        {transmission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            <div className="col-6 col-lg-3 order-13 filter-group">
              <div className="bc-select__wrapper">
                <div className={`bc-select ${selectedFilters.Condición === 'Nuevo' ? "bc-select--disabled" : ""}`} ref={this.plateRef} data-filter="Placa">
                  <label className="bc-select__label">Placa terminada en</label>
                  <div className="bc-select__input" onClick={() => this.toggleSelectState(this.plateRef.current)}>
                    <p>{selectedFilters.Placa || "Todas"}</p>
                    <i className="fenix-icon-arrow2-down"></i>
                  </div>
                  <div className="bc-select__options row">
                    <div
                      className="bc-select__option col-12"
                      onClick={(e) => this.handleSelectOption(this.plateRef.current, e.target)}
                    >
                      Todas
                      </div>
                    {filters.Placa.map((plate) => (
                      <div
                        className="bc-select__option col-12"
                        onClick={(e) => this.handleSelectOption(this.plateRef.current, e.target)}
                      >
                        {plate}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 order-14 filter-group">
              <div className="bc-quantity">
                <label className="bc-quantity__label">Airbags</label>
                <button
                  className={`bc-btn-icon bc-quantity__btn${
                    airBags === 0 ? " --disabled" : ""
                    }`}
                  data-operation="less"
                  onClick={this.handleChangeAirBags}
                >
                  <i class="icon-minus"></i>
                </button>
                <input className="bc-quantity__count" type="number" value={airBags} readOnly></input>
                <button
                  className="bc-btn-icon bc-quantity__btn"
                  data-operation="add"
                  onClick={this.handleChangeAirBags}
                >
                  <i class="icon-plus"></i>
                </button>
              </div>
            </div>

            {/* <div className="col-12 m-right-auto m-left-auto filter-group">
              {console.log('lucho prueba')}
              <p className="bc-checkbox-group__title">Estado</p>
              <div className="bc-checkbox-group__container" id="addOnsRef" ref={this.addOnsRef}>
                <div className="bc-checkbox col-6 col-lg-4" onClick={() => {}}>
                  <input
                    className="bc-checkbox__input"
                    type="checkbox"
                    name={`add-on-1`}
                    // checked={addOns.find(el => el === addOn)}
                  />
                  <div className="bc-checkbox__checkmark">
                    <i className="icon-check"></i>
                  </div>
                  <label className="bc-checkbox__label" for={`add-on-1`}>
                    Nuevo
                  </label>
                </div>
              </div>
            </div> */}

            <div className="col-11 col-lg-6 m-right-auto m-left-auto m-top-1 order-15 filter-group">
              <p className="bc-checkbox-group__title">Adicionales</p>

              <div className="bc-checkbox-group__container" id="addOnsRef" ref={this.addOnsRef}>
                {this.addOns.map((addOn, i) => (
                  <div className="bc-checkbox col-6 col-lg-4" onClick={this.updateCheckboxes.bind(this, addOn)}>
                    <input
                      className="bc-checkbox__input"
                      type="checkbox"
                      name={`add-on-${i}`}
                      checked={addOns.find(el => el === addOn)}
                    />
                    <div className="bc-checkbox__checkmark">
                      <i className="icon-check"></i>
                    </div>
                    <label className="bc-checkbox__label" for={`add-on-${i}`}>
                      {addOn}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-6 col-lg-3 m-right-auto m-left-auto m-top-1 order-4 filter-group ApliFilt">
              <button className="bc-btn clearFilter" onClick={this.handleCleanFilters}>
                <span>Borrar todo</span> <i className="fenix-icon-remove"></i>
              </button>
              <button className="bc-btn-primary js-search-btn" onClick={this.handleSearch}>
                BUSCAR
                </button>
            </div>

            <div className="col-12 m-right-auto m-left-auto m-top-3 m-bottom-2 order-16 filter-group BarDiplayIncategory">
              <div
                className="bc-search__adv-search bc-btn-icon-ghost"
                onClick={onClose}
                onMouseOver={this.toggleSearchMode}
              >
                <p>Búsqueda avanzada</p>
                <i className="fenix-icon-arrow2-up"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

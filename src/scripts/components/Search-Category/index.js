import fetch from "unfetch";
import { h, Component, createRef } from "preact";
import { createPortal } from "preact/compat";

import BCTypeSelect from "./TypeSelect";
import BCStickyFilters from "./StickyFilters";
import BCAdvancedSearchCategory from "./AdvancedSearch";
import BCRange from "../Slider/Range";

import SearchFunctions from "../../vendor/services/search";
import { handleCheckboxElements } from "../../base/forms";
import { ACCESS_TOKEN, FILTERS_DEFAULTS, MK_ID, SC_MIDDLE_API, VTEX_STOREID_FIELD } from "../../global/constants";
import { _formatMoney, _formatNumber, storeID } from "../../global/helpers";


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

export default class BCSearchCategory extends Component {
    typeSelectRef = createRef();
    brandSelectRef = createRef();

    initialState = {
        isAdvancedMode: false,
        brands: [],
        selectedTypes: [],
        selectedTypesBackUp: [],
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
        filters: {
            Condición: [],
            Ubicación: [],
            Placa: [],
            Transmisión: [],
            Combustible: [],
            Cilindraje: [],
            Línea: [],
            Marca: "",
            Model: [],
        },
        typePreview: {
            isVisible: false,
            title: "",
            image: "",
            positionLeft: 60,
        },
        Línea : [],
        priceValues: FILTERS_DEFAULTS.price,
        priceLimits: FILTERS_DEFAULTS.price,
        modelValues: [],
        modelLimits: [],
        mileageValue: FILTERS_DEFAULTS.mileage[1],
        airBags: 0,
        addOns: [],
    };

    constructor(props) {
        super(props);
        this.state = this.initialState;

        // Filtros Aplicados en el componente
        var preFilter = JSON.parse(localStorage.getItem("StateSeach"));
        if (!!preFilter && Object.keys(preFilter).length > 0) {
            if (preFilter.filters != undefined) {
                let selectedTypes = [];
                if (preFilter.selectedTypesBackUp.length) {
                    preFilter.selectedTypesBackUp.forEach((select) => {
                        selectedTypes.push(select);
                        $(document).ready(function () {
                            $(".bc-select__options")
                                .find(`input[name="${slugify(select.text.toLowerCase())}"]`)
                                .prop("checked", true);
                        });
                    });
                }
                this.state = {
                    ...preFilter,
                    isAdvancedMode: false,
                    selectedTypesBackUp: selectedTypes,
                    priceValues: preFilter.priceValues
                };
            } 
            localStorage.setItem("StateSeach", JSON.stringify(this.state));
        } else {
            localStorage.setItem("StateSeach", JSON.stringify(this.state));
        }
    }

    componentDidMount() {
        this.getSellerFilters();
        SearchFunctions.fetchMDFilter(
            "MR",
            (brands) => this.setState({ brands }),
            (err) => console.warn("Error on fetch brands", err)
        );
            
        handleCheckboxElements();
    }

    componentDidCatch(err){
        console.log(err);
    }

    getSellerFilters() {
        fetch(`${SC_MIDDLE_API.filters}?marketplaceId=${MK_ID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                accessToken: `${ACCESS_TOKEN}`,
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res && res.data) {
                    const { minimumPrice, maximumPrice, maximumModel, minimumModel } = res.data;

                    const priceLimits =
                            minimumPrice && maximumPrice ? [parseInt(minimumPrice), parseInt(maximumPrice)] : FILTERS_DEFAULTS.price,
                        modelLimits =
                            minimumModel && maximumModel ? [parseInt(minimumModel), parseInt(maximumModel)] : FILTERS_DEFAULTS.mileage;

                    const newState = { priceLimits, priceValues: this.state.priceValues || priceLimits, modelLimits, modelValues: this.state.modelValues || modelLimits };
                    this.initialState = { ...this.initialState, ...newState };
                    this.setState(newState);
                }
            })
            .catch((error) => {
                console.warn("Error SC Filters:", error);
            });
    }

    componentDidUpdate() {
        handleCheckboxElements();
    }

    toggleSearchMode = (e) => {
        const { isAdvancedMode, brands } = this.state;

        if (!isAdvancedMode) {
            this.setState(
                { isAdvancedMode: true },
                () => localStorage.setItem("StateSeach", JSON.stringify(this.state))
            );
        }
        else {
            this.setState({ isAdvancedMode: false }, () => localStorage.setItem("StateSeach", JSON.stringify(this.state)));
            window.screen.width < 1024 && $("html").animate({ scrollTop: 610 }, 500, "swing");
        }
        var preFilter = JSON.parse(localStorage.getItem("StateSeach"));
        /* if (Object.keys(preFilter).length > 0 && preFilter.filters != undefined) {
            if (isAdvancedMode) {
                let selectedTypes = [];
                if (preFilter.selectedTypes) {
                    preFilter.selectedTypes.forEach((select) => {
                        selectedTypes.push({ value: select, text: select });
                        setTimeout(function () {
                            $(".bc-select__options")
                                .find(`input[name="${slugify(select.toLowerCase())}"]`)
                                .prop("checked", true);
                        }, 300);
                    });
                }
                this.setState({
                    selectedTypes: selectedTypes,
         
                localStorage.setItem("StateSeach", JSON.stringify(this.state));
        } else {
            localStorage.setItem("StateSeach", JSON.stringify(this.state));
        }*/
        // if (window.screen.width > 1024 || $(document.body).hasClass("ovh")) $(document.body).toggleClass("ovh");

        e && e.preventDefault();
    };

    toggleSelectState = (selectRef) => {
        const currentActive = $(".bc-select--active");
        const jqSelectRef = $(selectRef);

        if (currentActive.length && !currentActive.is(selectRef)) currentActive.removeClass("bc-select--active");
        if (jqSelectRef.hasClass("bc-select-type") && jqSelectRef.offset().top > 0) {
            $("html").animate({ scrollTop: jqSelectRef.offset().top * 0.9 }, 500, "swing");
        }

        jqSelectRef.toggleClass("bc-select--active");
    };

    resolveSelectedTypes = () => {
        const { selectedTypesBackUp } = this.state;

        if (!selectedTypesBackUp.length) return "Todos";
        else return selectedTypesBackUp.map((type, i) => (i + 1 < selectedTypesBackUp.length ? `${type.text}, ` : type.text));
    };

    handleApplyTypeSelect = (e) => {
        const typeSelect = $(this.typeSelectRef.current);
        let selectedTypes = [];

        typeSelect.find("input:checked").each(function (_, element) {
            const text = typeSelect.find(`label[for="${element.name}"]`).text();
            selectedTypes.push({ value: element.name.replace("op-", ""), text });
        });

        this.toggleSelectState(this.typeSelectRef.current);
        this.setState({ selectedTypesBackUp: selectedTypes });
        e.preventDefault();
    };

    handleSelectBrand = (e, selectedBrand) => {

         /* const selectedBrand = this.state.brands.filter((brand) => brand.FieldValueId === $(e.target).data("value"))[0] || ""; */
         this.toggleSelectState(this.brandSelectRef.current);
         this.setState((prevState) => ({selectedFilters: { ...prevState.selectedFilters, Marca: selectedBrand }}));
        e.preventDefault();
    };

    handleChangePriceRange = (priceValues) => {
        this.setState({ priceValues });
    };

    handleRemoveTags = () => {
        const { isAdvancedMode, brands, priceLimits, modelLimits } = this.state;
        $("input.bc-checkbox__input").prop("checked", false);
        $("input.bc-checkbox__input").removeAttr("checked");
        $(".bc-checkbox-type").removeClass("bc-checkbox--active");

        this.initialState.priceValues = priceLimits;
        this.initialState.modelValues = modelLimits;

        this.setState({ ...this.initialState, isAdvancedMode, brands },
            () => {
                localStorage.setItem("StateSeach", JSON.stringify(this.state));
                this.buildSelectedFilters(true, "removeTags");
            });
        
        
    }

    handleClearFilters = (e) => {
        const { isAdvancedMode, brands } = this.state;
        $("input.bc-checkbox__input").prop("checked", false);
        $("input.bc-checkbox__input").removeAttr("checked");
        $(".bc-checkbox-type").removeClass("bc-checkbox--active");

        this.setState({ ...this.initialState, isAdvancedMode, brands },
            () => localStorage.setItem("StateSeach", JSON.stringify(this.state)));
        
        e && e.preventDefault();
    };

    handleSearch = (e, storag = false) => {
        const { 
            selectedFilters, 
            selectedTypesBackUp, 
            modelValues, 
            priceValues, 
            mileageValue,
            airBags,
            addOns,
        } = this.state;

        const isSearch = true;

        let filters = [];
  
        /* Type and sliders */
        if (selectedTypesBackUp?.length) filters.push({ id: "selectedTypes", values: selectedTypesBackUp });
        if (modelValues.toString() !== this.state.modelLimits.toString()) {
          filters.push({ id: "modelValues", values: modelValues, isSlider: true });
        }
        if (mileageValue !== FILTERS_DEFAULTS.mileage[1]) {
          filters.push({ id: "mileageValue", values: [mileageValue], format: _formatNumber });
        }
          filters.push({ id: "priceValues", values: priceValues, isSlider: true, format: _formatMoney });
  
        /* Select filters */
        let _selectedFilters = [];
        Object.keys(selectedFilters)
          .sort()
          .forEach((filter) => {
            if (selectedFilters[filter]) _selectedFilters.push({[filter]: selectedFilters[filter]});
          });
  
        
        if (_selectedFilters.length) filters.push({ id: "selectedFilters", values: _selectedFilters });
  
        if (addOns.length) filters.push({ id: "addOns", values: addOns });
  
        if (airBags) filters.push({ id: "airBags", values: airBags });

        localStorage.setItem("StateSeach", JSON.stringify(this.state));
        SearchFunctions.doAdvancedSearch(filters)
    };

    buildSelectedFilters = (isSearch, comesFrom = '') => {

        let filters = [];
        const url = new URL(window.location.href);

        if (
            !url.search.replace(VTEX_STOREID_FIELD, "").includes("specificationFilter_") 
            &&
            !url.search.replace(VTEX_STOREID_FIELD, "").includes("fq=P:[")
        ) {
            localStorage.setItem("StateSeach", JSON.stringify(this.initialState));
            return filters;
        }

        let localStore = JSON.parse(localStorage.getItem("StateSeach"));
        const { 
            selectedFilters, 
            selectedTypesBackUp, 
            modelValues, 
            priceValues, 
            priceLimits, 
            mileageValue, 
            addOns,
            airBags,
        } = localStore;

        if (airBags > 0) {
            filters.push({ id: "airBags", values: [`${airBags > 1 ? airBags + ' Airbags' : airBags + ' Airbag'}`] });
        }
        if (selectedTypesBackUp.length > 0) {
            let selcteTypes = [];
            selectedTypesBackUp.forEach((element) => {
                if (!!element.text) {
                    selcteTypes.push(element.text);
                } else {
                    selcteTypes.push(element);
                }
            });
            filters.push({ id: "selectedTypes", values: selcteTypes });
        }
        if (this.state.modelLimits[0] !== modelValues[0] || this.state.modelLimits[1] !== modelValues[1])
            filters.push({ id: "modelValues", values: modelValues, isSlider: true });
        if (mileageValue !== FILTERS_DEFAULTS.mileage[1]) {
            filters.push({ id: "mileageValue", values: [mileageValue], format: _formatNumber });
        }
        if (priceValues.toString() !== this.state.priceLimits.toString()) {
            filters.push({ id: "priceValues", values: priceValues, isSlider: true, format: _formatMoney });
        } else if (comesFrom !== "tags"){
            filters.push({ id: "priceValues", values: priceLimits, isSlider: true, format: _formatMoney });
        }

        /* Select filters */
        let _selectedFilters = [];
        Object.keys(selectedFilters).forEach((filter) => {
            if (selectedFilters[filter]) {
                if  (filter === "Placa") {
                    _selectedFilters.push(`Placa ${selectedFilters[filter]}`);
                } else {
                    _selectedFilters.push(selectedFilters[filter]);
                }
            }
            else if (isSearch) _selectedFilters.push(selectedFilters[filter]);
        });

        if (_selectedFilters.length) filters.push({ id: "selectedFilters", values: _selectedFilters });

        /* Checkboxes */

        if (addOns.length) filters.push({ id: "addOns", values: addOns });

        
        if (isSearch) {
            SearchFunctions.doAdvancedSearch(filters);
        } else {
            return filters;
        }
    };

    handleRemoveFilter = async (filterId, value) => {
        let localStore = JSON.parse(localStorage.getItem("StateSeach"));
        if (localStore.filters != undefined || this.state.isAdvancedMode) {
            /* Checkboxes */

            if (filterId === "airBags") {
                localStore.airBags = 0;
            }

            if (filterId === "state" || filterId === "selectedTypes") {
                const checkSelectorMap = {
                    selectedTypes: $(this.typeSelectRef.current),
                };
                const checkSelector = checkSelectorMap[filterId];

                checkSelector.find("input:checked").each(function (_, element) {
                    if (checkSelector.find(`label[for="${slugify(element.name)}"]`).text() === value) element.checked = false;
                });

                if (filterId === "selectedTypes") {
                    localStore.selectedTypesBackUp = this.state.selectedTypesBackUp.filter((type) => type.text !== value);
                }
            }

            if (filterId === "addOns") {
                localStore.addOns = localStore.addOns.filter((type) => type !== value);
            }

            /* Sliders */
            if (filterId === "mileageValue") {
                const defaultMap = {
                    mileageValue: FILTERS_DEFAULTS.mileage[1],
                };

                localStore.mileageValue = defaultMap.mileageValue;
            }
            if (filterId === "modelValues") {
                const defaultMap = {
                    modelValues: this.state.modelLimits,
                };

                localStore.modelValues = defaultMap.modelValues;
            }
            if (filterId === "priceValues") {
                const defaultMap = {
                    priceValues: this.state.priceLimits,
                };

                localStore.priceValues = defaultMap.priceValues;
            }

            /* Select filters */
            if (filterId === "selectedFilters") {
                const selectedFilters = {};

                Object.keys(localStore.selectedFilters).forEach((filter) => {
                    if (filter === "Placa" && localStore.selectedFilters[filter] === value.toString().substr(value.toString().length - 1, value.toString().length - 2)) {
                        selectedFilters[filter] = "";
                    }
                    else if (localStore.selectedFilters[filter] === value.toString()) {
                        selectedFilters[filter] = "";
                    } else {
                        selectedFilters[filter] = localStore.selectedFilters[filter];
                    }

                });

                localStore.selectedFilters = selectedFilters;
            }

            localStorage.setItem("StateSeach", JSON.stringify(localStore));
            this.setState({ ...localStore }, () => this.handleSearch());
        } 

    };

    tooltip_select_search = (e) => {
        if ($('.select_tooltip').hasClass('active')) {
            $(e.target).parent().siblings('.select_tooltip').removeClass('active')
        }
        else {
            $(e.target).parent().siblings('.select_tooltip').addClass('active')
        }
    };

    handleCleanFilters = (e) => {
        $(".bc-search-modal-lg .bc-checkbox--active").each(function (_, element) {
            const input = element.querySelector("input");
            input.checked = false;
            input.removeAttribute("checked");
            element.classList.remove("bc-checkbox--active");
        });
        this.setState({ ...this.filtersInitialState });
        localStorage.setItem("StateSeach", JSON.stringify(this.state));
        e && e.preventDefault();
    };

    render(_, state) {
        const { isAdvancedMode, brands, selectedFilters, priceValues, priceLimits, modelLimits, isSearchActive, selectedTypesBackUp } = state;

        if (!!isAdvancedMode)
            return (
                <div className="bc-search-modal-lg__wrapper">
                    <BCAdvancedSearchCategory
                        brands={brands}
                        priceLimits={priceLimits}
                        modelLimits={modelLimits}
                        onClose={this.toggleSearchMode}
                    />
                </div>
            );
        else
            return (
                <div className="container">
                    <div className="bc-search bc-search--simple m-bottom-4">
                        <div className="row no-gutters">
                            <div className="col-10 col-lg-3 m-right-auto m-left-auto">
                                <BCRange
                                    label="Precio"
                                    onChange={this.handleChangePriceRange}
                                    value={priceValues}
                                    limits={priceLimits || FILTERS_DEFAULTS.price}
                                    step={FILTERS_DEFAULTS.priceStep}
                                />
                            </div>

                            <div className="col-11 col-lg-3 m-right-auto m-left-auto TpeSlect">
                                <BCTypeSelect
                                    _ref={this.typeSelectRef}
                                    values={this.resolveSelectedTypes()}
                                    onOpen={(e) => {
                                        this.toggleSelectState(this.typeSelectRef.current);
                                        e.preventDefault();
                                    }}
                                    onApply={this.handleApplyTypeSelect}
                                    selectedTypes={selectedTypesBackUp}
                                />
                            </div>

                            <div className="col-11 col-lg-3 m-right-auto m-left-auto">
                                <div className="bc-select__wrapper">
                                    <div className="bc-select" ref={this.brandSelectRef}>
                                        <label className="bc-select__label">Marca</label>
                                        <div className="select_tooltip">{(selectedFilters && selectedFilters.Marca) || "Todas"}</div>
                                        <div
                                            className="bc-select__input"
                                            onClick={(e) => {
                                                this.toggleSelectState(this.brandSelectRef.current);
                                                e.preventDefault();
                                            }}
                                        >
                                            <p onMouseEnter={(e) => $(e.target).parent().siblings('.select_tooltip').addClass('active')} onMouseLeave={(e) => $(e.target).parent().siblings('.select_tooltip').removeClass('active')}>
                                                {/* {(selectedBrand && selectedBrand.value) || "Todas"} */}
                                                {(selectedFilters && selectedFilters.Marca) || "Todas"}
                                            </p>
                                            <i className="fenix-icon-arrow2-down"></i>
                                        </div>

                                        <div className="bc-select__options">
                                            <div
                                                className="bc-select__option col-12"
                                                data-value={null}
                                                onClick={e=> this.handleSelectBrand(e, "")}
                                            >
                                                Todas
                                            </div>
                                            {brands.map((brand, index) => brand.nombre && (
                                                <div
                                                    key={index}
                                                    className="bc-select__option col-12"
                                                    data-value={brand.id}
                                                    onClick={e => this.handleSelectBrand(e, brand.nombre)}
                                                >
                                                    {brand.nombre}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-9 col-lg-3 m-right-auto m-left-auto m-top-2">
                                <button className="bc-btn-primary js-search-btn" onClick={this.handleSearch}>
                                    Buscar
                                </button>
                                <button className="bc-btn m-top-2" onClick={this.handleClearFilters}>
                                    {/* Borrar filtros */}
                                    <span>Borrar todo</span> <i className="fenix-icon-remove"></i>
                                </button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 m-right-auto m-left-auto m-top-2">
                                <div className="bc-search__adv-search bc-btn-icon-ghost" onClick={this.toggleSearchMode}>
                                    <p>Búsqueda avanzada</p>
                                    <i className="fenix-icon-arrow2-down"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    {createPortal(
                        <BCStickyFilters
                            filters={this.buildSelectedFilters(false, "tags")}
                            onRemoveFilter={this.handleRemoveFilter}
                            onSearch={this.handleSearch}
                            onCleanFilters={this.handleRemoveTags}
                        />,
                        document.querySelector(".js-stick-filters")
                    )}
                </div>
            );
    }
}

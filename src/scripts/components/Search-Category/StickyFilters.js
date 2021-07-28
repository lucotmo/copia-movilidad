import { h, Component } from "preact";
import { VTEX_STOREID_FIELD } from "../../global/constants";

export default class BCStickyFilters extends Component {
    constructor(props) {
        super(props);

        const searchURLWithoutSeller = window.location.search.replace(`fq=${VTEX_STOREID_FIELD}`, "");

        if (!searchURLWithoutSeller.includes("fq")) {
            $(".searchResultsTime").hide();
            this.state = { isFiltersVisible: false };
        } else this.state = { isVisible: true, isFiltersVisible: true };
    }

    /* componentDidMount() {
        if (typeof IntersectionObserver === "undefined") return;

        const iOberverOptions = {
            root: null,
            rootMargin: "0px",
            threshold: [0.25],
        };
        const iOberver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                this.setState({ isVisible: !entry.isIntersecting && entry.boundingClientRect.y > 0 });
            });
        }, iOberverOptions);

        iOberver.observe(document.querySelector(this.props.baseButtonRef));
    } */

    toggleFiltersVisibility = () => {
        this.setState((prevState) => ({ isFiltersVisible: !prevState.isFiltersVisible }));
    };

    getTotalFilters() {
        const { filters } = this.props;
        let total = 0;
        filters.forEach((filter) => {
            if (filter.values) total += filter.isSlider ? 1 : filter.values.length;
        });

        return total;
    }

    render(props, state) {
        const { onSearch, onCleanFilters, filters, onRemoveFilter } = props;
        const { isVisible, isFiltersVisible } = state;
        /* var pathArray = window.location.pathname.split('/');
        if (pathArray[1] != 'busca'){
            return;
        } */
        return (
            <div className="bc-stick-filters Destokresolution">
                {isFiltersVisible && filters.length ? (
                    <div className="row no-gutters">
                        <div className="col-12 d-flex flex-acenter flex-sa" onLoad={this.getTotalFilters()}>
                            {filters.map((filter) => {
                                return !filter.isSlider ? (
                                    filter.values.map((value) => (
                                        <div className="bc-stick-filters__selected" onClick={() => onRemoveFilter(filter.id, value)}>
                                            <p>{filter.format ? filter.format(value) : value}</p>
                                            <i className="fenix-icon-remove"></i>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bc-stick-filters__selected" onClick={() => onRemoveFilter(filter.id)}>
                                        {filter.format ? (
                                            <p>{`${filter.format(filter.values[0])} - ${filter.format(filter.values[1])}`}</p>
                                        ) : (
                                            <p>{`${filter.values[0]} - ${filter.values[1]}`}</p>
                                        )}
                                        <i className="fenix-icon-remove"></i>
                                    </div>
                                );
                            })}
                            <button className="bc-btn-secundary" onClick={onCleanFilters}>
                                Borrar todo
                            </button>
                        </div>
                    </div>
                ) : (
                    ""
                )}
            </div>
        );
    }
}

import { h, Component } from "preact";

export default class BCStickyFilters extends Component {
    constructor(props) {
        super(props);
        this.state = { isVisible: true, isFiltersVisible: false };
    }

    componentDidMount() {
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
    }

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

        if (!isVisible) return;

        return (
            <div className="bc-stick-filters hidden-lg">
                {isFiltersVisible && (
                    <div className="row no-gutters">
                        <div className="col-11 m-bottom-2 link-no-unl">
                            <span className="bc-stick-filters__count">{this.getTotalFilters()}</span>
                            <span>Filtros seleccionados:</span>
                        </div>
                        <div className="col-1">
                            <i className="fenix-icon-error" onClick={this.toggleFiltersVisibility}></i>
                        </div>

                        <div className="col-12 d-flex flex-acenter flex-sa">
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
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-11 d-flex flex-acenter flex-column m-top-1 m-left-auto m-right-auto">
                        {isFiltersVisible && (
                            <button className="bc-btn-secundary m-bottom-2" onClick={onCleanFilters}>
                                Borrar todo
                            </button>
                        )}

                        <button className="bc-btn-primary" onClick={onSearch}>
                            Buscar
                        </button>

                        {!isFiltersVisible && (
                            <button className="bc-btn link-no-unl m-top-2" onClick={this.toggleFiltersVisibility}>
                                <span>Ver todos los filtros seleccionados</span>
                                <span className="bc-stick-filters__count">{this.getTotalFilters()}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

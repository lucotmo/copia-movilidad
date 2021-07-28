import { h } from "preact";
import { VEHICLE_TYPES } from "../../global/constants";

const BCTypeSelect = ({ _ref, onOpen, values, previeBtnClass, onApply, selectedTypes = [] }) => {

    return (
        <div className="bc-select__wrapper">
            <div className="bc-select bc-select-type" ref={_ref}>
                <label className="bc-select__label">Tipo de vehículo</label>
                <div className="select_tooltip">{values}</div>
                <div className="bc-select__input" onClick={onOpen}>
                    <p onMouseEnter={(e) => $(e.target).parent().siblings('.select_tooltip').addClass('active')} onMouseLeave={(e) => $(e.target).parent().siblings('.select_tooltip').removeClass('active')}>
                        {values}
                    </p>
                    <i className="fenix-icon-arrow2-down"></i>
                </div>
                <div
                    className={`bc-select__options row`}
                >
                    {VEHICLE_TYPES.map(type => (
                        <div className={`bc-select__option col-6 col-md-6 col-lg-12 d-flex ${type.onlyDesktop ? "visible-lg" : ""}`}>
                            <i className={`fenix-icon-info ${previeBtnClass}`}></i>
                            <div className="bc-checkbox bc-checkbox-type">
                                <input
                                    className="bc-checkbox__input"
                                    type="checkbox"
                                    name={type.name}
                                    checked={
                                        selectedTypes.length && selectedTypes.find(comingtype => comingtype.value === type.name)
                                    }
                                />
                                <div className="bc-checkbox__checkmark visible-lg">
                                    <i className="icon-check"></i>
                                </div>
                                <label className="bc-checkbox__label" for={type.name}>
                                    {type.label}
                                </label>
                                <div className={`fenix-icon-${type.name}`}></div>
                            </div>
                        </div>
                    ))}

                    <div className="bc-select-type__foot-btn col-8 m-top-1 m-left-auto m-right-auto">
                        <button className="bc-btn-primary" onCLick={onApply}>
                            Elegir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BCTypeSelect;

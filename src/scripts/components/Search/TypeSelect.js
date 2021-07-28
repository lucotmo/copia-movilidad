import { h, Component } from "preact";
import { VEHICLE_TYPES } from "../../global/constants";

export default class BCTypeSelect extends Component {
  constructor(props) {
    super(props);
  }

  change(e) {
    // this.props.change(e);
  }
  tooltip_select_search = (e) => {
    if ($('.select_tooltip').hasClass('active')) {
      $(e.target).parent().siblings('.select_tooltip').removeClass('active')
    }
    else {
      $(e.target).parent().siblings('.select_tooltip').addClass('active')
    }
  };

  render() {
    const { _ref, onOpen, values, previeBtnClass, onApply, onTypeSelect } = this.props;
    // const BCTypeSelect = ({ _ref, onOpen, values, previeBtnClass, onApply }) => {
    return (
      <div className="bc-select__wrapper">
        <div className="bc-select bc-select-type" ref={_ref}>
          <label className="bc-select__label">Tipo de vehículo</label>
          <div className='select_tooltip'>{values}</div>
          <div className="bc-select__input" onClick={onOpen}>
            <p onMouseEnter={(e) => $(e.target).parent().siblings('.select_tooltip').addClass('active')} onMouseLeave={(e) => $(e.target).parent().siblings('.select_tooltip').removeClass('active')}>
              {values}
            </p>
            <i className="fenix-icon-arrow2-down"></i>
          </div>
          <div className="bc-select__options row">
            {VEHICLE_TYPES.map(type => (
              <div className={`bc-select__option col-6 col-lg-12 d-flex ${type.onlyDesktop ? "visible-lg" : ""}`}>
                <i className={`fenix-icon-info ${previeBtnClass}`}></i>
                <div
                  className="bc-checkbox bc-checkbox-type"
                  onClick={!!onTypeSelect && onTypeSelect}
                >
                  <input className="bc-checkbox__input" type="checkbox" name={type.name} />
                  <div className="bc-checkbox__checkmark visible-lg">
                    <i className="icon-check"></i>
                  </div>
                  <label className="bc-checkbox__label" htmlFor={type.name}>
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
  }
};

// export default BCTypeSelect;

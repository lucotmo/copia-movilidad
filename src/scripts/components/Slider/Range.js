import { _formatMoney, _formatNumber } from "../../global/helpers";

import { h, Fragment } from "preact";
import Range from "rc-slider/lib/Range";

const BCRange = ({ value, label, limits, isNumeric, noFormat, onChange, step, disabled }) => {

    return (
        <div className={`bc-slider ${disabled ? "bc-select--disabled" : ""}`}>
            <p className="bc-slider__label">{label}</p>
            <Range 
                value={value} 
                allowCross={false} 
                count={limits.length} 
                min={limits[0]} 
                max={limits[1]} 
                step={step || 1} 
                onChange={onChange} 
            />
            <div className="d-flex flex-sb">
                {noFormat ? (
                    <Fragment>
                        <span>{value[0]}</span>
                        <span>{value[1]}</span>
                    </Fragment>
                ) : (
                    <Fragment>
                        <span>{isNumeric ? _formatNumber(value[0]) : _formatMoney(value[0])}</span>
                        <span>{isNumeric ? _formatNumber(value[1]) : _formatMoney(value[1])}</span>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
    

export default BCRange;

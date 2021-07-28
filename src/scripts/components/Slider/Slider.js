import { h } from "preact";
import Slider from "rc-slider/lib/Slider";

import { _formatMoney, _formatNumber } from "../../global/helpers";

const BCSlider = ({ label, limits, isNumeric, suffix, preffix, value, onChange, step, disabled }) => {
    return (
        <div className={`bc-slider ${disabled ? "bc-select--disabled" : ""}`}>
            <p className="bc-slider__label">{label}</p>
            <Slider value={value} min={limits[0]} max={limits[1]} onChange={onChange} step={step || 1} />
            <div className="d-flex flex-sb">
                <span>
                    {preffix} {isNumeric ? _formatNumber(value) : _formatMoney(value)} {suffix}
                </span>
            </div>
        </div>
    );
};

export default BCSlider;

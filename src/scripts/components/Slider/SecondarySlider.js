import { h } from "preact";
import Slider from "rc-slider/lib/Slider";

import { _formatMoney, _formatNumber } from "../../global/helpers";

const BCSecondarySlider = ({ label, limits, value, onChange, step }) => {
    return (
        <div className=" bc-slider bc-slider-secondary">
            <div className="  row no-gutters flex-sb">
                <p className=" p-simulator  bc-slider-secondary__label col-size-4 col-size-4-mobile">{label}</p>
                <p className=" p-simulator bc-slider-secondary__value col-size-4 col-size-4-mobile">{_formatMoney(value)}</p>
            </div>
            <Slider value={value} min={limits[0]} max={limits[1]} onChange={onChange} step={step || 1} />
        </div>
    );
};

export default BCSecondarySlider;

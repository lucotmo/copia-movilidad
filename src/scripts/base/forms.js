export const setBCSelectValue = (jqSelectRef, { value, text }) => {
    jqSelectRef.data("selected", value);
    jqSelectRef.find(".bc-select__input p").text(text);
    jqSelectRef.removeClass("bc-select--active");
};

export const handleCheckboxElements = () => {
    $(".bc-checkbox").each((_, element) => {
        if ($._data(element, "events")) return; // Prevent duplicate listeners

        $(element).on("click", function (e) {
            const _this = $(this);

            if (_this.find("input:checked").length) _this.find("input").removeAttr("checked");
            else _this.find("input").attr("checked", "checked");

            _this.toggleClass("bc-checkbox--active");
            e.preventDefault();
        });
    });
};

export const handleSelectElements = () => {
    $(".bc-select").each((_, element) => {
        if ($._data(element, "events")) return; // Prevent duplicate listeners

        $(element).on("click", function (e) {
            const _target = $(e.target),
                _this = $(this);

            if (_target.parent().hasClass("bc-select__input")) _this.toggleClass("bc-select--active");
            if (_target.hasClass("bc-select__option")) setBCSelectValue(_this, { value: _target.data("value"), text: _target.text() });

            e.preventDefault();
        });
    });
};

const inputElementsConfig = {
    onKeyUp: false,
};
export const handleInputElements = ({ onKeyUp } = inputElementsConfig) => {
    function validate() {
        if (this.checkValidity()) this.classList.contains("invalid") && this.classList.remove("invalid");
        else !this.classList.contains("invalid") && this.classList.add("invalid");
    }

    $(".bc-input input").each((_, element) => {
        $(element).on("blur", function () {
            if (this.value) this.classList.add("fill");
            else this.classList.remove("fill");
        });

        $(element).on("change", validate);
        if (onKeyUp) $(element).on("keyup bind cut copy paste", validate);
    });
};

export const getSelectedCheckboxes = (selectReference) => {
    let values = [];

    selectReference.find("input:checked").each(function () {
        values.push($(this).attr("name").replace("op-", ""));
    });

    return values;
};

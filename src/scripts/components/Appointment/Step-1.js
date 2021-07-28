import "air-datepicker/dist/js/datepicker.min";
import { h, Component, Fragment } from "preact";
import { createPortal } from "preact/compat";

import "../../vendor/datepicker.es";
import BCAppointmentStepper from "./Stepper";
import { MK_ID, SC_API_URL } from "../../global/constants";
import { showToastifyMessage } from "../../global/helpers";

export default class BCAppointmentS1 extends Component {
    datePickerRef = null;
    currentDate = new Date();
    defaultTimeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };
    slickLastIndex = -1;
    sellerUrl = SC_API_URL;

    constructor(props) {
        super(props);
        this.currentDate.setHours(0, 0, 0, 0);
        this.state = {
            locationName: props.location.name ? props.location.name : "Ubicación no disponible",
            locationAddress: props.location.address ? props.location.address : "No podemos obtener la información de la tienda.",
            selectedDate: props.date ? new Date(props.date) : this.currentDate,
            days: [],
            hours: [],
        };
    }

    toggleDatePicker = (e) => {
        this.datePickerRef.show();
        e.preventDefault();
    };

    getDaysInMonth = (month, year) => {
        let today = new Date();
        let day = String(today.getDate()).padStart(2, '0');
        let date = new Date(year, month, day);
        const days = [];

        while (date.getMonth() === month) {
            if (date.getDay() != 0) days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return days;
    };

    onChageDatePicker = (_, date) => {
        if (!date) return;

        const monthNames = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ];

        this.datePickerRef.date = date;
        $(".dateshow").text(monthNames[date.getMonth()] + ", " + date.getFullYear());

        const days = this.getDaysInMonth(date.getMonth(), date.getFullYear());
        this.setState({ days });
    };

    onSelectDay = (e) => {
        const selectedDate = new Date($(e.target).data("date"));
        this.setState({ selectedDate: selectedDate });
        this.getHoursByDay(selectedDate);
        e.preventDefault();
    };

    getHoursByDay = (selectedDate = null) => {
        fetch(
            `${this.sellerUrl}/schedule/api/v1/get-availability-by-sku?SkuId=${productInfo.items[0].itemId}&AppointmentType=${
                this.props.type == "test-drive" ? "DrivingTest" : "Concessionaire"
            }&Date=${`${selectedDate.toISOString()}`}&marketplaceId=${MK_ID}`
        )
            .then((res) => res.json())
            .then((schedule) => {
                if (schedule.length)
                    this.setState({
                        hours: schedule
                            .map((obj) => new Date(Date.parse("2020-07-14T" + obj.time)))
                            .sort((a, b) => a - b),
                    });
                else
                    this.setState({
                        hours: [],
                    });
            })
            .catch((err) => console.error(err));
    };

    handleNextStep = () => {
        const { selectedDate, locationAddress, locationName } = this.state;

        if (selectedDate && new Date(selectedDate).getHours() !== 0) {
            this.props.onNext([
                { propName: "date", propValue: selectedDate },
                {
                    propName: "location",
                    propValue: {
                        address: locationAddress,
                        name: locationName,
                    },
                },
            ]);
        } else
            showToastifyMessage({
                message: "Selecciona una fecha y hora para continuar",
                blockRepeat: true,
                type: "alert",
            });
    };

    handleSetHour = (e) => {
        this.setState((state) => {
            const { selectedDate } = state;
            selectedDate.setHours($(e.target).data("hour"), 0, 0, 0);//

            return { selectedDate: new Date(selectedDate) };
        });
    };

    isSameDayAndMonth = (date1, date2) => date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();

    changeDatePickerViewMode = (mode) => {
        const date = new Date(this.datePickerRef.date);

        if (mode === "next") date.setMonth(date.getMonth() + 1);
        if (mode === "prev") date.setMonth(date.getMonth() - 1);

        date.setDate(1);

        this.slickLastIndex = -1;
        this.datePickerRef.selectDate(date);
    };

    componentDidMount() {
        const { date } = this.props;
        this.datePickerRef = $(".js-datepicker")
            .datepicker({
                autoClose: true,
                language: "es",
                minView: "months",
                view: "months",
                dateFormat: "MM, yyyy",
                position: "bottom right",
                offset: 50,
                minDate: this.currentDate,
                onSelect: this.onChageDatePicker,
                prevHtml: '<i class="icon-chevron-left"></i>',
                nextHtml: '<i class="icon-chevron-right"></i>',
            })
            .data("datepicker");

        const selectedDate = date ? new Date(date) : this.currentDate;
        this.datePickerRef.selectDate(selectedDate);
        this.getHoursByDay(selectedDate);
    }

    componentWillUpdate(_, nextState) {
        if (
            nextState.days &&
            nextState.days.length &&
            this.state.days &&
            this.state.days.length &&
            JSON.stringify(nextState.days) !== JSON.stringify(this.state.days)
        ) {
            $(".days").slick("unslick");
            $(".days").html("");
        }
    }

    componentDidUpdate(_, prevState) {
        const { days, selectedDate } = this.state;
        if (JSON.stringify(prevState.days) !== JSON.stringify(days)) {
            $(".days")
                .slick({
                    // slidesToShow: 6,
                    infinite: false,
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 1200,
                            settings: {
                                // slidesToShow: 6,
                                slidesToShow: 5,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 1025,
                            settings: {
                                slidesToShow: 5,
                                slidesToScroll: 2,
                            },
                        },
                        {
                            breakpoint: 769,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                            },
                        },
                    ]
                })
                .on("afterChange", (ev, _, currentSlide) => {
                    
                    if (this.slickLastIndex !== currentSlide) this.slickLastIndex = currentSlide;
                    ev.stopImmediatePropagation();
                });


                const { slideCount } = $(".days").slick("getSlick"),
                      month          = days[0].getMonth(),
                      prevMonth      = prevState.days[0] ? prevState.days[0].getMonth() : 0,
                      selectedMonth  = selectedDate.getMonth(),
                      less           = window.screen.width <= 1024 ? 2 : 5;

                if (month === selectedMonth) {
                    const lastSlide = selectedDate.getDate() - 1 > slideCount ? slideCount - less : selectedDate.getDate() - 1 - less;
                    $(".days").slick("slickGoTo", 1);
                } else if (prevMonth) {
                    $(".days").slick("slickGoTo", month < prevMonth ? slideCount - less : 0);
                }

                
        }
    }

    componentDidCatch(err) {
        console.log(err);
    }

    render(props, state) {
        const { onPrev, onClose, type } = props;
        const { locationName, locationAddress, days, hours, selectedDate } = state;
        const renderDays = days.length > 0 &&
        days.map((day) => {
            const currentDateNoTime = this.currentDate;
            currentDateNoTime.setHours(0, 0, 0, 0);

            return (
                <button 
                    key={day.toDateString()}
                    className={`days__dayNumber ${
                        this.isSameDayAndMonth(day, selectedDate) ? "active slick-slide" : "slick-slide"
                    }`}
                    disabled={currentDateNoTime.getTime() > day.getTime()}
                    data-date={day}
                    onClick={this.onSelectDay}
                >
                    <p>{day.toLocaleString("es-CO", { day: "numeric" })}</p>
                    <span className="dayName">{day.toLocaleString("es-CO", { weekday: "long" })}</span>
                </button>
            );
        });
        
        return (
            <div className="optionsCalendar bc-modal">
                <div className="optionsCalendar__contentCalendar">
                    {onPrev && (
                        <span className="return-modal icon-angle-left" onClick={onPrev}>
                            <p>Volver</p>
                        </span>
                    )}
                    <span className="close-modal fenix-icon-error" onClick={onClose}></span>

                    <BCAppointmentStepper state={["active", "default", "default"]} />

                    <title>Escoge fecha y hora</title>

                    <div className="addressInfo">
                        <div className="contentAddress">
                            <div className="icon"></div>
                            {type != "test-drive" ? (
                                <div className="title">{locationName}</div>
                            ) : (
                                <div className="title">Agendar Prueba de Manejo - {locationName}</div>
                            )}
                            <div className="address">{locationAddress}</div>
                        </div>
                    </div>

                    <div className="calendarConcessionaire">
                        <div className="infoPrincipal">
                            <input className="js-datepicker" readOnly />
                            <div className="date">
                                <div class="date-picker dateshow" onClick={this.toggleDatePicker}></div>
                            </div>
                            <div className="seeAllCalendar">
                                <button onClick={this.toggleDatePicker}>
                                    <p>Ver calendario</p>
                                    <div className="icon-calendar-alt"></div>
                                </button>
                            </div>
                        </div>
                       <div className="days">
                            {renderDays && document.querySelector(".days .slick-track")
                            ? createPortal(renderDays, document.querySelector(".days .slick-track"))
                            : renderDays}
                        </div>

                        {selectedDate && (
                            <div className="hourRanges">
                                {hours.length > 0 ? (
                                    <Fragment>
                                        <div className="morning">
                                            <title>Mañana</title>
                                            <div className="contentRange">
                                                {hours
                                                    .filter((obj) => obj.getHours() < 12)
                                                    .map((hour) => {
                                                        const time = hour;

                                                        return (
                                                            <div
                                                                className="range"
                                                                onClick={this.handleSetHour}
                                                                data-hour={time.getHours()}
                                                            >
                                                                <input
                                                                    name={`hour-${hour}`}
                                                                    type="radio"
                                                                    name="rangodehora"
                                                                    checked={time.getHours() === new Date(selectedDate).getHours()}
                                                                />
                                                                <label for={`hour-${hour}`}>
                                                                    {time
                                                                        .toLocaleTimeString("es-CO", this.defaultTimeOptions)
                                                                        .replace(/\.\s/g, ".")
                                                                        .replace(/([m])\./g, "m")}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        <div className="afternoon">
                                            <title>Tarde</title>
                                            <div className="contentRange">
                                                {hours
                                                    .filter((obj) => obj.getHours() >= 12)
                                                    .map((hour) => {
                                                        const time = hour;

                                                        return (
                                                            <div
                                                                className="range"
                                                                data-hour={time.getHours()}
                                                                onClick={this.handleSetHour}
                                                            >
                                                                <input
                                                                    name={`hour-${hour}`}
                                                                    type="radio"
                                                                    name="rangodehora"
                                                                    checked={time.getHours() === new Date(selectedDate).getHours()}
                                                                />
                                                                <label for={`hour-${hour}`}>
                                                                    {time
                                                                        .toLocaleTimeString("es-CO", this.defaultTimeOptions)
                                                                        .replace(/\.\s/g, ".")
                                                                        .replace(/([m])\./g, "m")}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </Fragment>
                                ) : (
                                    <div className="disclaimer">No hay horarios disponibles en la fecha seleccionada.</div>
                                )}

                                <div className="dateSelection">
                                    <p>
                                        {selectedDate
                                            .toLocaleTimeString("es-CO", {
                                                ...this.defaultTimeOptions,
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })
                                            .replace(/\.\s/g, ".")}
                                    </p>
                                </div>

                                <div className="disclaimer">
                                    Los horarios están sujetos a disponiblidad y podrán cambiar una vez seleccionados con oportuna
                                    comunicación al usuario.
                                </div>
                            </div>
                        )}

                        <div className="sectionButtons">
                            <button className="bc-btn-primary" onClick={this.handleNextStep}>
                                Continuar
                            </button>
                            <button className="bc-btn-secundary-white" onClick={onPrev}>
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



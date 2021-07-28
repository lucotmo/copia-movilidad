export const FORMAT_MONEY_DEFAULTS = {
    precision: 0,
    thousand: ".",
    decimal: ",",
};

export const FORMAT_NUMBER_DEFAULTS = {
    precision: 0,
    thousand: ".",
};

export const VEHICLE_TYPES = [
    { name: "sedan", label: "Sedán", image: "/arquivos/preview-sedan.jpg" },
    { name: "hatchback", label: "Hatchback", image: "/arquivos/preview-hatchback.jpg" },
    { name: "suv", label: "SUV", image: "/arquivos/preview-SUV.jpg" },
    { name: "camioneta", label: "Camioneta", onlyDesktop: true, image: "/arquivos/preview-camioneta.jpg" },
    { name: "pickup", label: "Pickup", image: "/arquivos/preview-pickup.jpg" },
    { name: "coupe", label: "Coupé", image: "/arquivos/preview-coupe.jpg" },
    { name: "minivan", label: "Minivan", image: "/arquivos/preview-minivan.jpg" },
];

const currentYear = new Date().getFullYear();

export const FILTERS_DEFAULTS = {
    price: [0, 400000000],
    priceStep: 100000,
    mileage: [0, 100000],
    mileageStep: 10000,
    model: [currentYear - 10, currentYear],
};

export const VTEX_STOREID_FIELD = "specificationFilter_91";

export const LS_COMPARATOR = {
    list: "ComparatorList",
    category: "ComparatorCategory",
    maxItemsDesktop: 3,
    maxItemsMobile: 2,
};

export const PUBSUB_COMPARATOR = {
    add: "comparator/add",
    remove: "comparator/remove",
    clear: "comparator/clear",
    error: "comparator/error",
};

export const SC_MIDDLE_URL = process.env.SC_MIDDLE_URL;
export const  SC_API_URL = process.env.SC_API_URL;
export const CREDIT_URL = process.env.CREDIT_URL;
export const SITE_CATEGORY_KEY = process.env.SITE_CATEGORY_KEY;

export const SC_MIDDLE_API = {
    favs: SC_MIDDLE_URL +"/api/favorites",
    sellers: SC_MIDDLE_URL +"/api/sellers",
    recoments: SC_MIDDLE_URL +"/api/vehicles/get-recommended",
    filters: SC_API_URL + "/product/api/filter-core/v1/search-advanced"
};

export const MINUTES_UNTIL_AUTO_LOGOUT = 20;
export const RECOMEND_CLUSTER_ID = 137;

export const MK_ID = "A5F1A6F5-366D-4D0F-CE10-08D7F6806092";
export const ACCESS_TOKEN = "913adf0f-6e90-4180-9cf3-3284b3728796";

export const WISHLIST_MD_ACRO = "FV";
import { publish } from "pubsub-js";
import { LS_COMPARATOR, PUBSUB_COMPARATOR } from "../global/constants";

const resources = {
    getComparatorList: () => JSON.parse(localStorage.getItem(LS_COMPARATOR.list)),
    setComparatorList: (newList) => localStorage.setItem(LS_COMPARATOR.list, JSON.stringify(newList)),
    getComparatorCategory: () => localStorage.getItem(LS_COMPARATOR.category),
    setComparatorCategory: (newCategory) => localStorage.setItem(LS_COMPARATOR.category, newCategory),
    removeComparator: () => {
        localStorage.removeItem(LS_COMPARATOR.list);
        localStorage.removeItem(LS_COMPARATOR.category);
    },
    getListMaxSize: () => (window.screen.width <= 768 ? LS_COMPARATOR.maxItemsMobile : LS_COMPARATOR.maxItemsDesktop),
};

const ComparatorServices = {
    isProductInList: (productId) => {
        const currentList = resources.getComparatorList() || [];

        if (currentList.length === 0) return false;
        else return typeof currentList.filter((prod) => prod.id === productId)[0] !== "undefined";
    },
    getCategory: () => resources.getComparatorCategory(),
    getProductList: () => resources.getComparatorList(),
    addProduct: (product) => {
        const currentList = resources.getComparatorList() || [];
        const currentCategory = resources.getComparatorCategory() || "";
        const maxSize = resources.getListMaxSize();

        if (currentList.length) {
            if (currentList.length >= maxSize) return publish(PUBSUB_COMPARATOR.error, `Solo puedes comparar ${maxSize} productos`);
            if (currentList.filter((prod) => prod.id === product.id)[0]) {
                return publish(PUBSUB_COMPARATOR.error, "El producto ya fue seleccionado para comparar");
            }
        }

        if (currentCategory === "") {
            resources.setComparatorCategory(product.category);
        }

        currentList.push(product);
        resources.setComparatorList(currentList);
        publish(PUBSUB_COMPARATOR.add, currentList);
    },
    removeProduct: (productId) => {
        let currentList = resources.getComparatorList() || [];

        if (currentList.length) {
            currentList = currentList.filter((prod) => prod.id !== productId);
            resources.setComparatorList(currentList);

            if (currentList.length === 0) resources.setComparatorCategory("");

            publish(PUBSUB_COMPARATOR.remove, currentList);
        } else {
            publish(PUBSUB_COMPARATOR.error, "La lista de productos para comparar está vacía.");
        }
    },
    cleanList: () => {
        resources.removeComparator();
        publish(PUBSUB_COMPARATOR.clear);
    },
};

export default ComparatorServices;

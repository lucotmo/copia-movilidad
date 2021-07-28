const loaderEl = document.getElementsByClassName("fullpage-loader")[0];
document.addEventListener("readystatechange", function () {
    if (document.readyState === "complete") {
        loaderEl.classList.add("fullpage-loader--invisible");
        setTimeout(function () { loaderEl.parentNode.removeChild(loaderEl); }, 2000);
    }
});

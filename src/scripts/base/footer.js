/*
 ** NOTE: This script was provided by the client
 */

"use strict";

function toggleItem() {
    var itemClass = this.parentNode.className;
    for (var i = 0; i < accItem.length; i++) {
        accItem[i].className = "accordionItem cerrar";
    }
    if (itemClass == "accordionItem cerrar") {
        this.parentNode.className = "accordionItem open";
    }
}

var accItem = document.getElementsByClassName("accordionItem");
var accHD = document.getElementsByClassName("tituloAcordeon");

for (var i = 0; i < accHD.length; i++) {
    accHD[i].addEventListener("click", toggleItem, !1);
}

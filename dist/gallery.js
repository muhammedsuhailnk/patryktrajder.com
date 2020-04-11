"use strict";
var lists = document.getElementsByClassName("thumbListItems");
for (var i = 0; i < lists.length; i++) {
    setUpSlider(lists[i]);
}
function setUpSlider(slider) {
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    slider.addEventListener("pointerdown", function (e) {
        console.log("pointerdown " + e.pointerId);
        isGrabbing = true;
        startX = e.pageX;
        scrollStartLeft = slider.scrollLeft;
        slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointerup", function (e) {
        console.log("pointerup " + e.pointerId);
        isGrabbing = false;
        slider.releasePointerCapture(e.pointerId);
    });
    slider.addEventListener("contextmenu", function (e) {
        console.log("contextmenu");
        isGrabbing = false;
        //slider.releasePointerCapture(e.pointerId);
    });
    slider.addEventListener("pointermove", function (e) {
        if (!isGrabbing)
            return;
        e.preventDefault();
        console.log("pointermove " + e.pointerId);
        var offset = e.pageX - startX;
        slider.scrollLeft = scrollStartLeft - offset;
    });
    for (var i = 0; i < slider.childNodes.length; i++)
        setupSliderItem(slider.childNodes[i], slider);
}
var abortClickDistance = 10;
function setupSliderItem(item, slider) {
    var abortClick = false;
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    item.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        console.log("i pointerdown" + " " + e.pageX + " " + slider.scrollLeft);
        abortClick = false;
        isGrabbing = true;
        startX = e.pageX;
        scrollStartLeft = slider.scrollLeft;
        item.setPointerCapture(e.pointerId);
    });
    item.addEventListener("pointerup", function (e) {
        e.stopPropagation();
        console.log("i pointerup");
        isGrabbing = false;
        item.releasePointerCapture(e.pointerId);
    });
    item.addEventListener("pointermove", function (e) {
        if (!isGrabbing)
            return;
        e.preventDefault();
        e.stopPropagation();
        console.log("i pointermove " + e.pageX + " " + startX + " " + scrollStartLeft);
        var offset = e.pageX - startX;
        if (offset > abortClickDistance || offset < -abortClickDistance)
            abortClick = true;
        slider.scrollLeft = scrollStartLeft - offset;
    });
    item.addEventListener("click", function (e) {
        if (abortClick)
            return;
        var offset = e.pageX - startX;
        if (offset > abortClickDistance || offset < -abortClickDistance)
            return;
        console.log("i click");
        showPreview(item);
    });
}
function showPreview(img) {
    var gallery = img.closest(".gallery");
    var previewImg = gallery === null || gallery === void 0 ? void 0 : gallery.querySelector(".preview > img");
    previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}
//# sourceMappingURL=gallery.js.map
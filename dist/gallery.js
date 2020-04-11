"use strict";
var lists = document.getElementsByClassName("thumbListItems");
for (var i = 0; i < lists.length; i++) {
    setUpSlider(lists[i]);
}
function setUpSlider(slider) {
    var abortClick = false;
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    var handlePointerMove = function (e) {
        if (!isGrabbing)
            return;
        var offset = e.pageX - startX;
        if (offset > abortClickDistance || offset < -abortClickDistance)
            abortClick = true;
        slider.scrollLeft = scrollStartLeft - offset;
    };
    var handleDragEnd = function (e) {
        isGrabbing = false;
        slider.releasePointerCapture(e.pointerId);
        slider.removeEventListener("pointermove", handlePointerMove);
        slider.removeEventListener("pointerup", handleDragEnd);
        slider.removeEventListener("lostpointercapture", handleDragEnd);
    };
    slider.addEventListener("pointerdown", function (e) {
        abortClick = false;
        isGrabbing = true;
        startX = e.pageX;
        scrollStartLeft = slider.scrollLeft;
        slider.setPointerCapture(e.pointerId);
        slider.addEventListener("pointermove", handlePointerMove);
        slider.addEventListener("pointerup", handleDragEnd);
        slider.addEventListener("lostpointercapture", handleDragEnd);
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
    var handlePointerMove = function (e) {
        if (!isGrabbing)
            return;
        var offset = e.pageX - startX;
        if (offset > abortClickDistance || offset < -abortClickDistance)
            abortClick = true;
        slider.scrollLeft = scrollStartLeft - offset;
    };
    var handleDragEnd = function (e) {
        isGrabbing = false;
        item.releasePointerCapture(e.pointerId);
        item.removeEventListener("pointermove", handlePointerMove);
        item.removeEventListener("pointerup", handleDragEnd);
        item.removeEventListener("lostpointercapture", handleDragEnd);
    };
    item.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        abortClick = false;
        isGrabbing = true;
        startX = e.pageX;
        scrollStartLeft = slider.scrollLeft;
        item.setPointerCapture(e.pointerId);
        item.addEventListener("pointermove", handlePointerMove);
        item.addEventListener("pointerup", handleDragEnd);
        item.addEventListener("lostpointercapture", handleDragEnd);
    });
    item.addEventListener("click", function (e) {
        if (abortClick)
            return;
        var offset = e.pageX - startX;
        if (offset > abortClickDistance || offset < -abortClickDistance)
            return;
        showPreview(item);
    });
}
function showPreview(img) {
    var gallery = img.closest(".gallery");
    var previewImg = gallery === null || gallery === void 0 ? void 0 : gallery.querySelector(".preview > img");
    previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}
//# sourceMappingURL=gallery.js.map
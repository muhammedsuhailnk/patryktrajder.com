"use strict";
var galleries = document.getElementsByClassName("gallery");
for (var i = 0; i < galleries.length; i++) {
    var list = galleries[i].getElementsByClassName("thumbListItems")[0];
    setUpSlider(list);
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
        if (offset > abortClickDistance || offset < -abortClickDistance) {
            abortClick = true;
            item.classList.add("dragging");
        }
        slider.scrollLeft = scrollStartLeft - offset;
    };
    var handleDragEnd = function (e) {
        isGrabbing = false;
        item.classList.remove("dragging");
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
function closeFullImage(button) {
    var overlay = button.closest(".full");
    if (!overlay)
        return;
    overlay.style.display = "none";
}
function showFullImage(img) {
    var gallery = img.closest(".gallery");
    if (!gallery)
        return;
    var overlay = gallery.querySelector(".full");
    if (!overlay)
        return;
    overlay.style.display = "block";
    var fullImg = overlay.querySelector("img");
    if (!fullImg)
        return;
    fullImg.src = img.src.replace("-h400.jpg", ".jpg");
}
function showPreview(img) {
    var gallery = img.closest(".gallery");
    if (!gallery)
        return;
    var previewImg = gallery.querySelector(".preview > img");
    if (!previewImg)
        return;
    previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}
function toggleZoom(img) {
    if (img.classList.contains("zoom")) {
        img.classList.remove("zoom");
    }
    else {
        img.classList.add("zoom");
        var imgHeight = img.naturalHeight;
        var imgWidth = img.naturalWidth;
    }
}
//# sourceMappingURL=gallery.js.map
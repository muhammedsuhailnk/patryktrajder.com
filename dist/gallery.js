"use strict";
var abortClickDistance = 3;
var bodyOverflow = document.body.style.overflow;
var galleries = document.getElementsByClassName("gallery");
for (var i = 0; i < galleries.length; i++) {
    var list = galleries[i].querySelector(".thumbListItems");
    if (list)
        setUpSlider(list);
    var full = galleries[i].querySelector(".full");
    if (full)
        setUpZoom(full);
}
function setUpSlider(slider) {
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    var handlePointerMove = function (e) {
        if (!isGrabbing)
            return;
        var offset = e.x - startX;
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
        isGrabbing = true;
        startX = e.x;
        scrollStartLeft = slider.scrollLeft;
        slider.setPointerCapture(e.pointerId);
        slider.addEventListener("pointermove", handlePointerMove);
        slider.addEventListener("pointerup", handleDragEnd);
        slider.addEventListener("lostpointercapture", handleDragEnd);
    });
    for (var i = 0; i < slider.childNodes.length; i++)
        setUpSliderItem(slider.childNodes[i], slider);
}
function setUpSliderItem(item, slider) {
    var abortClick = false;
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    var handlePointerMove = function (e) {
        if (!isGrabbing)
            return;
        var offset = e.x - startX;
        if (Math.abs(offset) > abortClickDistance) {
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
        startX = e.x;
        scrollStartLeft = slider.scrollLeft;
        item.setPointerCapture(e.pointerId);
        item.addEventListener("pointermove", handlePointerMove);
        item.addEventListener("pointerup", handleDragEnd);
        item.addEventListener("lostpointercapture", handleDragEnd);
    });
    item.addEventListener("click", function (e) {
        if (abortClick)
            return;
        var offset = e.x - startX;
        if (Math.abs(offset) > abortClickDistance)
            return;
        showPreview(item);
    });
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
    document.body.style.overflow = "hidden";
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
function setUpZoom(full) {
    var img = full.querySelector("img");
    if (!img)
        return;
    var button = full.querySelector(".close");
    button === null || button === void 0 ? void 0 : button.addEventListener("click", function () {
        document.body.style.overflow = bodyOverflow;
        full.style.display = "none";
        zoomOut();
    });
    var abortClick = false;
    var isGrabbing = false;
    var startX;
    var startY;
    var startLeft;
    var startTop;
    var handlePointerMove = function (e) {
        if (!isGrabbing)
            return;
        e.preventDefault();
        var offsetX = e.x - startX;
        var offsetY = e.y - startY;
        if (Math.abs(offsetX) > abortClickDistance ||
            Math.abs(offsetY) > abortClickDistance) {
            abortClick = true;
            img.classList.add("dragging");
        }
        var left = startLeft + offsetX;
        var top = startTop + offsetY;
        var maxLeft = full.clientWidth / 2;
        var maxTop = full.clientHeight / 2;
        var minLeft = maxLeft - img.naturalWidth;
        var minTop = maxTop - img.naturalHeight;
        left = Math.min(Math.max(left, minLeft), maxLeft);
        top = Math.min(Math.max(top, minTop), maxTop);
        img.style.left = left + "px";
        img.style.top = top + "px";
    };
    var handleDragEnd = function (e) {
        isGrabbing = false;
        img.classList.remove("dragging");
        img.releasePointerCapture(e.pointerId);
        img.removeEventListener("pointermove", handlePointerMove);
        img.removeEventListener("pointerup", handleDragEnd);
        img.removeEventListener("lostpointercapture", handleDragEnd);
    };
    var handlePointerDown = function (e) {
        e.stopPropagation();
        abortClick = false;
        isGrabbing = true;
        startX = e.x;
        startY = e.y;
        startLeft = parseFloat(img.style.left);
        startTop = parseFloat(img.style.top);
        img.setPointerCapture(e.pointerId);
        img.addEventListener("pointermove", handlePointerMove);
        img.addEventListener("pointerup", handleDragEnd);
        img.addEventListener("lostpointercapture", handleDragEnd);
    };
    var zoomOut = function () {
        full.classList.remove("zoom");
        img.style.left = "0";
        img.style.top = "0";
        img.style.bottom = "0";
        img.style.right = "0";
        img.removeEventListener("pointerdown", handlePointerDown);
    };
    var zoomIn = function (x, y) {
        var xRatio = x / img.width;
        var yRatio = y / img.height;
        var left = -xRatio * img.naturalWidth + full.clientWidth / 2;
        var top = -yRatio * img.naturalHeight + full.clientHeight / 2;
        img.style.left = left + "px";
        img.style.top = top + "px";
        img.style.bottom = "auto";
        img.style.right = "auto";
        full.classList.add("zoom");
        img.addEventListener("pointerdown", handlePointerDown);
    };
    img.addEventListener("click", function (e) {
        if (full.classList.contains("zoom")) {
            if (abortClick)
                return;
            var offsetX = e.x - startX;
            var offsetY = e.y - startY;
            if (Math.abs(offsetX) > abortClickDistance ||
                Math.abs(offsetY) > abortClickDistance)
                return;
            zoomOut();
        }
        else {
            zoomIn(e.offsetX, e.offsetY);
        }
    });
}
function zoomOut(full, img) { }
//# sourceMappingURL=gallery.js.map
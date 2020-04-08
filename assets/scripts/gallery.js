//import { Draggable } from "@shopify/draggable";
var lists = document.getElementsByClassName("thumbListItems");
for (var i = 0; i < lists.length; i++) {
    setUpSlider(lists[i]);
}
function setUpSlider(slider) {
    var isGrabbing = false;
    var startX;
    var scrollStartLeft;
    slider.addEventListener("pointerdown", function (e) {
        console.log("pointerdown");
        isGrabbing = true;
        startX = e.pageX - slider.offsetLeft;
        scrollStartLeft = slider.scrollLeft;
        slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener("pointerup", function (e) {
        console.log("mouseup");
        isGrabbing = false;
        slider.releasePointerCapture(e.pointerId);
    });
    slider.addEventListener("pointermove", function (e) {
        if (!isGrabbing)
            return;
        e.preventDefault();
        console.log("mousemove");
        var x = e.pageX - slider.offsetLeft;
        var offset = x - startX;
        slider.scrollLeft = scrollStartLeft - offset;
        console.log(offset);
    });
}

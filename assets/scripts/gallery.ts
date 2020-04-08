//import { Draggable } from "@shopify/draggable";

const lists: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "thumbListItems"
);

for (let i = 0; i < lists.length; i++) {
  setUpSlider(lists[i] as HTMLElement);
}

function setUpSlider(slider: HTMLElement) {
  let isGrabbing: boolean = false;
  let startX: number;
  let scrollStartLeft: number;

  slider.addEventListener("pointerdown", (e) => {
    console.log("pointerdown");
    isGrabbing = true;
    startX = e.pageX - slider.offsetLeft;
    scrollStartLeft = slider.scrollLeft;
    slider.setPointerCapture(e.pointerId);
  });

  slider.addEventListener("pointerup", (e) => {
    console.log("mouseup");
    isGrabbing = false;
    slider.releasePointerCapture(e.pointerId);
  });

  slider.addEventListener("pointermove", (e) => {
    if (!isGrabbing) return;
    e.preventDefault();
    console.log("mousemove");
    const x = e.pageX - slider.offsetLeft;
    const offset = x - startX;
    slider.scrollLeft = scrollStartLeft - offset;
    console.log(offset);
  });
}

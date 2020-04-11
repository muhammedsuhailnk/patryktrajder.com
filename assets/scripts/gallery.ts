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
    isGrabbing = true;
    startX = e.pageX;
    scrollStartLeft = slider.scrollLeft;
    slider.setPointerCapture(e.pointerId);
  });

  slider.addEventListener("pointerup", (e) => {
    isGrabbing = false;
    slider.releasePointerCapture(e.pointerId);
  });

  slider.addEventListener("pointermove", (e) => {
    if (!isGrabbing) return;
    e.preventDefault();
    const offset = e.pageX - startX;
    slider.scrollLeft = scrollStartLeft - offset;
  });

  for (let i = 0; i < slider.childNodes.length; i++)
    setupSliderItem(slider.childNodes[i] as HTMLImageElement, slider);
}

const abortClickDistance: number = 10;
function setupSliderItem(item: HTMLImageElement, slider: HTMLElement) {
  let abortClick: boolean = false;
  let isGrabbing: boolean = false;
  let startX: number;
  let scrollStartLeft: number;

  item.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    abortClick = false;
    isGrabbing = true;
    startX = e.pageX;
    scrollStartLeft = slider.scrollLeft;
    item.setPointerCapture(e.pointerId);
  });

  item.addEventListener("pointerup", (e) => {
    e.stopPropagation();
    isGrabbing = false;
    item.releasePointerCapture(e.pointerId);
  });

  item.addEventListener("pointermove", (e) => {
    if (!isGrabbing) return;
    e.preventDefault();
    e.stopPropagation();
    const offset = e.pageX - startX;
    if (offset > abortClickDistance || offset < -abortClickDistance)
      abortClick = true;
    slider.scrollLeft = scrollStartLeft - offset;
  });

  item.addEventListener("click", (e) => {
    if (abortClick) return;
    const offset = e.pageX - startX;
    if (offset > abortClickDistance || offset < -abortClickDistance) return;
    showPreview(item);
  });
}

function showPreview(img: HTMLImageElement) {
  const gallery = img.closest(".gallery");
  const previewImg = gallery?.querySelector(
    ".preview > img"
  ) as HTMLImageElement;
  previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}

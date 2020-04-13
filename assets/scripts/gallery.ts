const galleries: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "gallery"
);

for (let i = 0; i < galleries.length; i++) {
  const list = galleries[i].getElementsByClassName("thumbListItems")[0];
  setUpSlider(list as HTMLElement);
}

function setUpSlider(slider: HTMLElement) {
  let abortClick: boolean = false;
  let isGrabbing: boolean = false;
  let startX: number;
  let scrollStartLeft: number;

  let handlePointerMove = (e: PointerEvent) => {
    if (!isGrabbing) return;
    const offset = e.pageX - startX;
    if (offset > abortClickDistance || offset < -abortClickDistance)
      abortClick = true;
    slider.scrollLeft = scrollStartLeft - offset;
  };

  let handleDragEnd = (e: PointerEvent) => {
    isGrabbing = false;
    slider.releasePointerCapture(e.pointerId);
    slider.removeEventListener("pointermove", handlePointerMove);
    slider.removeEventListener("pointerup", handleDragEnd);
    slider.removeEventListener("lostpointercapture", handleDragEnd);
  };

  slider.addEventListener("pointerdown", (e) => {
    abortClick = false;
    isGrabbing = true;
    startX = e.pageX;
    scrollStartLeft = slider.scrollLeft;
    slider.setPointerCapture(e.pointerId);
    slider.addEventListener("pointermove", handlePointerMove);
    slider.addEventListener("pointerup", handleDragEnd);
    slider.addEventListener("lostpointercapture", handleDragEnd);
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

  let handlePointerMove = (e: PointerEvent) => {
    if (!isGrabbing) return;
    const offset = e.pageX - startX;
    if (offset > abortClickDistance || offset < -abortClickDistance) {
      abortClick = true;
      item.classList.add("dragging");
    }
    slider.scrollLeft = scrollStartLeft - offset;
  };

  let handleDragEnd = (e: PointerEvent) => {
    isGrabbing = false;
    item.classList.remove("dragging");
    item.releasePointerCapture(e.pointerId);
    item.removeEventListener("pointermove", handlePointerMove);
    item.removeEventListener("pointerup", handleDragEnd);
    item.removeEventListener("lostpointercapture", handleDragEnd);
  };

  item.addEventListener("pointerdown", (e) => {
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

  item.addEventListener("click", (e) => {
    if (abortClick) return;
    const offset = e.pageX - startX;
    if (offset > abortClickDistance || offset < -abortClickDistance) return;
    showPreview(item);
  });
}

function closeFullImage(button: HTMLButtonElement) {
  const overlay = button.closest<HTMLElement>(".full");
  if (!overlay) return;
  overlay.style.display = "none";
}

function showFullImage(img: HTMLImageElement) {
  const gallery = img.closest(".gallery");
  if (!gallery) return;
  const overlay = gallery.querySelector<HTMLElement>(".full");
  if (!overlay) return;
  overlay.style.display = "block";
  const fullImg = overlay.querySelector<HTMLImageElement>("img");
  if (!fullImg) return;
  fullImg.src = img.src.replace("-h400.jpg", ".jpg");
}

function showPreview(img: HTMLImageElement) {
  const gallery = img.closest(".gallery");
  if (!gallery) return;
  const previewImg = gallery.querySelector<HTMLImageElement>(".preview > img");
  if (!previewImg) return;
  previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}

function toggleZoom(img: HTMLImageElement) {
  if (img.classList.contains("zoom")) {
    img.classList.remove("zoom");
  } else {
    img.classList.add("zoom");
    let imgHeight = img.naturalHeight;
    let imgWidth = img.naturalWidth;
  }
}

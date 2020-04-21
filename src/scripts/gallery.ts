const abortClickDistance: number = 3;
const bodyOverflow = document.body.style.overflow;
const galleries: HTMLCollectionOf<Element> = document.getElementsByClassName(
  "gallery"
);

for (let i = 0; i < galleries.length; i++) {
  const list = galleries[i].querySelector<HTMLElement>(".thumbListItems");
  if (list) setUpSlider(list);
  const full = galleries[i].querySelector<HTMLElement>(".full");
  if (full) setUpZoom(full);
}

function setUpSlider(slider: HTMLElement) {
  let isGrabbing: boolean = false;
  let startX: number;
  let scrollStartLeft: number;

  let handlePointerMove = (e: PointerEvent) => {
    if (!isGrabbing) return;
    const offset = e.x - startX;
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
    isGrabbing = true;
    startX = e.x;
    scrollStartLeft = slider.scrollLeft;
    slider.setPointerCapture(e.pointerId);
    slider.addEventListener("pointermove", handlePointerMove);
    slider.addEventListener("pointerup", handleDragEnd);
    slider.addEventListener("lostpointercapture", handleDragEnd);
  });

  for (let i = 0; i < slider.childNodes.length; i++)
    setUpSliderItem(slider.childNodes[i] as HTMLImageElement, slider);
}

function setUpSliderItem(item: HTMLImageElement, slider: HTMLElement) {
  let abortClick: boolean = false;
  let isGrabbing: boolean = false;
  let startX: number;
  let scrollStartLeft: number;

  let handlePointerMove = (e: PointerEvent) => {
    if (!isGrabbing) return;
    const offset = e.x - startX;
    if (Math.abs(offset) > abortClickDistance) {
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
    startX = e.x;
    scrollStartLeft = slider.scrollLeft;
    item.setPointerCapture(e.pointerId);
    item.addEventListener("pointermove", handlePointerMove);
    item.addEventListener("pointerup", handleDragEnd);
    item.addEventListener("lostpointercapture", handleDragEnd);
  });

  item.addEventListener("click", (e) => {
    if (abortClick) return;
    const offset = e.x - startX;
    if (Math.abs(offset) > abortClickDistance) return;
    showPreview(item);
  });
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
  document.body.style.overflow = "hidden";
}

function showPreview(img: HTMLImageElement) {
  const gallery = img.closest(".gallery");
  if (!gallery) return;
  const previewImg = gallery.querySelector<HTMLImageElement>(".preview > img");
  if (!previewImg) return;
  previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
}

function setUpZoom(full: HTMLElement) {
  const img = full.querySelector<HTMLImageElement>("img");
  if (!img) return;

  const button = full.querySelector<HTMLButtonElement>(".close");
  button?.addEventListener("click", () => {
    document.body.style.overflow = bodyOverflow;
    full.style.display = "none";
    zoomOut();
  });

  let abortClick: boolean = false;
  let isGrabbing: boolean = false;
  let startX: number;
  let startY: number;
  let startLeft: number;
  let startTop: number;

  let handlePointerMove = (e: PointerEvent) => {
    if (!isGrabbing) return;
    e.preventDefault();
    const offsetX = e.x - startX;
    const offsetY = e.y - startY;
    if (
      Math.abs(offsetX) > abortClickDistance ||
      Math.abs(offsetY) > abortClickDistance
    ) {
      abortClick = true;
      img.classList.add("dragging");
    }
    let left = startLeft + offsetX;
    let top = startTop + offsetY;
    let maxLeft = full.clientWidth / 2;
    let maxTop = full.clientHeight / 2;
    let minLeft = maxLeft - img.naturalWidth;
    let minTop = maxTop - img.naturalHeight;
    left = Math.min(Math.max(left, minLeft), maxLeft);
    top = Math.min(Math.max(top, minTop), maxTop);
    img.style.left = left + "px";
    img.style.top = top + "px";
  };

  let handleDragEnd = (e: PointerEvent) => {
    isGrabbing = false;
    img.classList.remove("dragging");
    img.releasePointerCapture(e.pointerId);
    img.removeEventListener("pointermove", handlePointerMove);
    img.removeEventListener("pointerup", handleDragEnd);
    img.removeEventListener("lostpointercapture", handleDragEnd);
  };

  let handlePointerDown = (e: PointerEvent) => {
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

  let zoomOut = () => {
    full.classList.remove("zoom");
    img.style.left = "0";
    img.style.top = "0";
    img.style.bottom = "0";
    img.style.right = "0";
    img.removeEventListener("pointerdown", handlePointerDown);
  };

  let zoomIn = (e: MouseEvent) => {
    let xRatio = e.offsetX / img.width;
    let yRatio = e.offsetY / img.height;
    let left = -xRatio * img.naturalWidth + e.x;
    let top = -yRatio * img.naturalHeight + e.y;
    img.style.left = left + "px";
    img.style.top = top + "px";
    img.style.bottom = "auto";
    img.style.right = "auto";
    full.classList.add("zoom");
    img.addEventListener("pointerdown", handlePointerDown);
  };

  img.addEventListener("click", (e: MouseEvent) => {
    if (full.classList.contains("zoom")) {
      if (abortClick) return;

      const offsetX = e.x - startX;
      const offsetY = e.y - startY;
      if (
        Math.abs(offsetX) > abortClickDistance ||
        Math.abs(offsetY) > abortClickDistance
      )
        return;

      zoomOut();
    } else {
      zoomIn(e);
    }
  });
}

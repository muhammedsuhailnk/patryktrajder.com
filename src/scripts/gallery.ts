class Gallery {
  private static readonly bodyOverflow = document.body.style.overflow;
  private readonly closeButton: HTMLButtonElement;
  private readonly full: HTMLElement;
  private readonly fullImg: HTMLImageElement;
  private readonly gallery: Element;
  private readonly previewImg: HTMLImageElement;
  private abortClick: boolean = false;
  private isGrabbing: boolean = false;
  private startLeft: number = 0;
  private startTop: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  constructor(gallery: Element) {
    this.gallery = gallery;
    this.full = gallery.querySelector(".full") as HTMLElement;
    this.fullImg = this.full.querySelector("img") as HTMLImageElement;
    this.closeButton = this.full.querySelector(".close") as HTMLButtonElement;
    this.previewImg = gallery.querySelector(
      ".preview > img"
    ) as HTMLImageElement;

    this.previewImg.addEventListener("click", this.showFullImage);
    this.setUpZoom();

    const list = gallery.querySelector<HTMLElement>(".thumbListItems");
    if (list) new Slider(list, this);
  }

  public showPreview = (img: HTMLImageElement) => {
    this.previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isGrabbing) return;
    e.preventDefault();
    const offsetX = e.x - this.startX;
    const offsetY = e.y - this.startY;
    if (
      Math.abs(offsetX) > Constants.abortClickDistance ||
      Math.abs(offsetY) > Constants.abortClickDistance
    ) {
      this.abortClick = true;
      this.fullImg.classList.add("dragging");
    }
    let left = this.startLeft + offsetX;
    let top = this.startTop + offsetY;
    let maxLeft = this.full.clientWidth / 2;
    let maxTop = this.full.clientHeight / 2;
    let minLeft = maxLeft - this.fullImg.naturalWidth;
    let minTop = maxTop - this.fullImg.naturalHeight;
    left = Math.min(Math.max(left, minLeft), maxLeft);
    top = Math.min(Math.max(top, minTop), maxTop);
    this.fullImg.style.left = left + "px";
    this.fullImg.style.top = top + "px";
  };

  private handleDragEnd = (e: PointerEvent) => {
    this.isGrabbing = false;
    this.fullImg.classList.remove("dragging");
    this.fullImg.releasePointerCapture(e.pointerId);
    this.fullImg.removeEventListener("pointermove", this.handlePointerMove);
    this.fullImg.removeEventListener("pointerup", this.handleDragEnd);
    this.fullImg.removeEventListener("lostpointercapture", this.handleDragEnd);
  };

  private handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    this.abortClick = false;
    this.isGrabbing = true;
    this.startX = e.x;
    this.startY = e.y;
    this.startLeft = parseFloat(this.fullImg.style.left);
    this.startTop = parseFloat(this.fullImg.style.top);
    this.fullImg.setPointerCapture(e.pointerId);
    this.fullImg.addEventListener("pointermove", this.handlePointerMove);
    this.fullImg.addEventListener("pointerup", this.handleDragEnd);
    this.fullImg.addEventListener("lostpointercapture", this.handleDragEnd);
  };

  private showFullImage = () => {
    this.full.style.display = "block";
    this.fullImg.src = this.previewImg.src.replace("-h400.jpg", ".jpg");
    document.body.style.overflow = "hidden";
  };

  private setUpZoom = () => {
    this.closeButton.addEventListener("click", () => {
      document.body.style.overflow = Gallery.bodyOverflow;
      this.full.style.display = "none";
      this.zoomOut();
    });

    this.fullImg.addEventListener("click", (e: MouseEvent) => {
      if (this.full.classList.contains("zoom")) {
        if (this.abortClick) return;

        const offsetX = e.x - this.startX;
        const offsetY = e.y - this.startY;
        if (
          Math.abs(offsetX) > Constants.abortClickDistance ||
          Math.abs(offsetY) > Constants.abortClickDistance
        )
          return;

        this.zoomOut();
      } else {
        this.zoomIn(e);
      }
    });
  };

  private zoomIn = (e: MouseEvent) => {
    let xRatio = e.offsetX / this.fullImg.width;
    let yRatio = e.offsetY / this.fullImg.height;
    let left = -xRatio * this.fullImg.naturalWidth + e.x;
    let top = -yRatio * this.fullImg.naturalHeight + e.y;
    this.fullImg.style.left = left + "px";
    this.fullImg.style.top = top + "px";
    this.fullImg.style.bottom = "auto";
    this.fullImg.style.right = "auto";
    this.full.classList.add("zoom");
    this.fullImg.addEventListener("pointerdown", this.handlePointerDown);
  };

  private zoomOut = () => {
    this.full.classList.remove("zoom");
    this.fullImg.style.left = "0";
    this.fullImg.style.top = "0";
    this.fullImg.style.bottom = "0";
    this.fullImg.style.right = "0";
    this.fullImg.removeEventListener("pointerdown", this.handlePointerDown);
  };
}

class Slider {
  private readonly slider: HTMLElement;
  private isGrabbing: boolean = false;
  private startX: number = 0;
  private scrollStartLeft: number = 0;

  constructor(slider: HTMLElement, gallery: Gallery) {
    this.slider = slider;
    slider.addEventListener("pointerdown", this.handlePointerDown);

    for (let i = 0; i < slider.childNodes.length; i++)
      new SliderItem(slider.childNodes[i] as HTMLImageElement, slider, gallery);
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.isGrabbing = true;
    this.startX = e.x;
    this.scrollStartLeft = this.slider.scrollLeft;
    this.slider.setPointerCapture(e.pointerId);
    this.slider.addEventListener("pointermove", this.handlePointerMove);
    this.slider.addEventListener("pointerup", this.handleDragEnd);
    this.slider.addEventListener("lostpointercapture", this.handleDragEnd);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isGrabbing) return;
    const offset = e.x - this.startX;
    this.slider.scrollLeft = this.scrollStartLeft - offset;
  };

  private handleDragEnd = (e: PointerEvent) => {
    this.isGrabbing = false;
    this.slider.releasePointerCapture(e.pointerId);
    this.slider.removeEventListener("pointermove", this.handlePointerMove);
    this.slider.removeEventListener("pointerup", this.handleDragEnd);
    this.slider.removeEventListener("lostpointercapture", this.handleDragEnd);
  };
}

class SliderItem {
  private readonly item: HTMLImageElement;
  private readonly slider: HTMLElement;
  private abortClick: boolean = false;
  private isGrabbing: boolean = false;
  private startX: number = 0;
  private scrollStartLeft: number = 0;

  constructor(item: HTMLImageElement, slider: HTMLElement, gallery: Gallery) {
    this.item = item;
    this.slider = slider;
    item.addEventListener("pointerdown", this.handlePoinderDown);

    item.addEventListener("click", (e: MouseEvent) => {
      if (this.abortClick) return;
      const offset = e.x - this.startX;
      if (Math.abs(offset) > Constants.abortClickDistance) return;
      gallery.showPreview(item);
    });
  }

  private handlePoinderDown = (e: PointerEvent) => {
    e.stopPropagation();
    this.abortClick = false;
    this.isGrabbing = true;
    this.startX = e.x;
    this.scrollStartLeft = this.slider.scrollLeft;
    this.item.setPointerCapture(e.pointerId);
    this.item.addEventListener("pointermove", this.handlePointerMove);
    this.item.addEventListener("pointerup", this.handleSliderDragEnd);
    this.item.addEventListener("lostpointercapture", this.handleSliderDragEnd);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isGrabbing) return;
    const offset = e.x - this.startX;
    if (Math.abs(offset) > Constants.abortClickDistance) {
      this.abortClick = true;
      this.item.classList.add("dragging");
    }
    this.slider.scrollLeft = this.scrollStartLeft - offset;
  };

  private handleSliderDragEnd = (e: PointerEvent) => {
    this.isGrabbing = false;
    this.item.classList.remove("dragging");
    this.item.releasePointerCapture(e.pointerId);
    this.item.removeEventListener("pointermove", this.handlePointerMove);
    this.item.removeEventListener("pointerup", this.handleSliderDragEnd);
    this.item.removeEventListener(
      "lostpointercapture",
      this.handleSliderDragEnd
    );
  };
}

const galleries = document.getElementsByClassName("gallery");

for (let i = 0; i < galleries.length; i++) new Gallery(galleries[i]);

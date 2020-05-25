import Constants from "./constants";
import Slider from "./slider";

export default class Gallery {
  private readonly closeButton: HTMLButtonElement;
  private readonly full: HTMLElement;
  private readonly fullImg: HTMLImageElement;
  private readonly gallery: Element;
  private readonly nThumbs?: number;
  private readonly previewImg: HTMLImageElement;
  private readonly slider?: Slider;
  private abortClick: boolean = false;
  private isGrabbing: boolean = false;
  private nLoadedThumbs: number = 0;
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
    this.fullImg.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
    this.setUpZoom();

    const sliderElement = gallery.querySelector<HTMLElement>(".slider");
    if (sliderElement) {
      this.slider = new Slider(sliderElement as HTMLElement);
      const list = sliderElement.querySelector<HTMLElement>(".items");
      if (list) {
        this.nThumbs = list.childElementCount;
        for (let i = 0; i < this.nThumbs; i++) {
          let thumb = list.children[i] as HTMLImageElement;
          thumb.addEventListener("click", () => this.showPreview(thumb));
          thumb.addEventListener("load", () => this.handleThumbLoad(thumb), {
            once: true
          });
        }
      }
    }
  }

  public showPreview = (img: HTMLImageElement) => {
    this.previewImg.src = img.src.replace("h100.jpg", "h400.jpg");
  };

  private handleThumbLoad = (thumb: HTMLImageElement) => {
    this.nLoadedThumbs++;
    if (this.nLoadedThumbs === this.nThumbs) {
      this.slider?.update();
    }
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
    this.fullImg.src = this.previewImg.src.replace("-h400.jpg", ".jpg");
    this.fullImg.addEventListener(
      "load",
      () => {
        this.full.style.display = "block";
        document.body.style.overflow = "hidden";
      },
      { once: true }
    );
  };

  private setUpZoom = () => {
    this.closeButton.addEventListener("click", () => {
      document.body.style.overflow = Constants.bodyOverflow;
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
